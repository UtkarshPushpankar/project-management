"""
Rule Engine - Critical Path Method (CPM) and Risk Scoring
Contains deterministic algorithms for project analysis
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Tuple, Set
from collections import defaultdict

from models.schemas import (
    TaskInput, DependencyInput, Bottleneck, Alert, 
    ResourceConflict, DependencyType, TaskStatus
)


def normalize_datetime(dt: datetime) -> datetime:
    """Convert any datetime to naive UTC for consistent comparisons"""
    if dt is None:
        return datetime.utcnow()
    if dt.tzinfo is not None:
        # Convert to UTC then strip timezone
        return dt.replace(tzinfo=None)
    return dt


def now_utc() -> datetime:
    """Get current time as naive UTC datetime"""
    return datetime.utcnow()


class RuleEngine:
    """
    Rule-based engine for project scheduling analysis.
    Implements Critical Path Method (CPM) and risk scoring algorithms.
    """
    
    def __init__(self, tasks: List[TaskInput], dependencies: List[DependencyInput]):
        self.tasks = {t.id: t for t in tasks}
        self.dependencies = dependencies
        self._build_dependency_graph()
    
    def _build_dependency_graph(self):
        """Build adjacency lists for dependency traversal"""
        # task_id -> list of task_ids it depends on
        self.depends_on: Dict[str, List[str]] = defaultdict(list)
        # task_id -> list of task_ids that depend on it
        self.dependents: Dict[str, List[str]] = defaultdict(list)
        
        for dep in self.dependencies:
            self.depends_on[dep.taskId].append(dep.dependsOnTaskId)
            self.dependents[dep.dependsOnTaskId].append(dep.taskId)
    
    def calculate_critical_path(self) -> Tuple[List[str], int]:
        """
        Calculate the critical path using CPM.
        Returns: (list of task IDs in critical path, total duration in days)
        """
        if not self.tasks:
            return [], 0
        
        # For simplicity, use due_date based path finding
        # In real CPM, we'd use task duration estimates
        
        # Find tasks with no dependencies (start tasks)
        start_tasks = [
            t_id for t_id in self.tasks 
            if not self.depends_on.get(t_id)
        ]
        
        if not start_tasks:
            # All tasks have dependencies - find earliest due date
            start_tasks = [min(self.tasks.keys(), key=lambda x: normalize_datetime(self.tasks[x].due_date))]
        
        # Calculate earliest finish times (forward pass)
        earliest_finish: Dict[str, datetime] = {}
        
        def get_earliest_finish(task_id: str, visited: Set[str] = None) -> datetime:
            if visited is None:
                visited = set()
            
            if task_id in visited:
                return earliest_finish.get(task_id, normalize_datetime(self.tasks[task_id].due_date))
            visited.add(task_id)
            
            if task_id in earliest_finish:
                return earliest_finish[task_id]
            
            task = self.tasks.get(task_id)
            if not task:
                return now_utc()
            
            task_due = normalize_datetime(task.due_date)
            
            deps = self.depends_on.get(task_id, [])
            if not deps:
                earliest_finish[task_id] = task_due
            else:
                # Earliest finish is max of all dependency finishes
                dep_finishes = [get_earliest_finish(d, visited.copy()) for d in deps if d in self.tasks]
                if dep_finishes:
                    earliest_finish[task_id] = max(dep_finishes + [task_due])
                else:
                    earliest_finish[task_id] = task_due
            
            return earliest_finish[task_id]
        
        # Calculate for all tasks
        for task_id in self.tasks:
            get_earliest_finish(task_id)
        
        # Find the longest path (critical path)
        if not earliest_finish:
            return list(self.tasks.keys())[:1], 0
        
        # End task is the one with latest finish
        end_task = max(earliest_finish.keys(), key=lambda x: earliest_finish[x])
        
        # Trace back to find critical path
        critical_path = []
        current = end_task
        visited = set()
        
        while current and current not in visited:
            visited.add(current)
            critical_path.append(current)
            deps = self.depends_on.get(current, [])
            if deps:
                # Follow the dependency with latest finish time
                valid_deps = [d for d in deps if d in earliest_finish]
                if valid_deps:
                    current = max(valid_deps, key=lambda x: earliest_finish[x])
                else:
                    break
            else:
                break
        
        critical_path.reverse()
        
        # Calculate total duration
        if critical_path:
            first_task = self.tasks.get(critical_path[0])
            last_task = self.tasks.get(critical_path[-1])
            if first_task and last_task:
                last_due = normalize_datetime(last_task.due_date)
                first_created = normalize_datetime(first_task.createdAt)
                total_days = (last_due - first_created).days
                return critical_path, max(0, total_days)
        
        return critical_path, 0
    
    def detect_resource_conflicts(self) -> List[ResourceConflict]:
        """
        Find users with overlapping task assignments.
        Conflict = same user has multiple tasks with overlapping date ranges.
        """
        conflicts = []
        
        # Group tasks by assignee
        user_tasks: Dict[str, List[TaskInput]] = defaultdict(list)
        for task in self.tasks.values():
            if task.status != TaskStatus.DONE:
                user_tasks[task.assigneeId].append(task)
        
        # Check for overlaps per user
        for user_id, tasks in user_tasks.items():
            if len(tasks) < 2:
                continue
            
            # Sort by due date
            sorted_tasks = sorted(tasks, key=lambda t: normalize_datetime(t.due_date))
            
            # Simple overlap detection: if more than 3 tasks in same week
            overlapping_tasks = []
            for i, task in enumerate(sorted_tasks):
                task_due = normalize_datetime(task.due_date)
                week_tasks = [t for t in sorted_tasks 
                             if abs((normalize_datetime(t.due_date) - task_due).days) <= 7]
                if len(week_tasks) >= 3 and task.id not in overlapping_tasks:
                    overlapping_tasks.extend([t.id for t in week_tasks])
            
            if len(set(overlapping_tasks)) >= 3:
                conflicts.append(ResourceConflict(
                    userId=user_id,
                    userName=sorted_tasks[0].assigneeName,
                    taskIds=list(set(overlapping_tasks)),
                    overlapDays=7
                ))
        
        return conflicts
    
    def detect_blocked_tasks(self) -> List[str]:
        """Find tasks blocked by incomplete dependencies"""
        blocked = []
        
        for task_id, deps in self.depends_on.items():
            task = self.tasks.get(task_id)
            if not task or task.status == TaskStatus.DONE:
                continue
            
            for dep_id in deps:
                dep_task = self.tasks.get(dep_id)
                if dep_task and dep_task.status != TaskStatus.DONE:
                    blocked.append(task_id)
                    break
        
        return blocked
    
    def detect_overdue_tasks(self) -> List[str]:
        """Find tasks past their due date"""
        now = now_utc()
        overdue = []
        
        for task in self.tasks.values():
            task_due = normalize_datetime(task.due_date)
            if task.status != TaskStatus.DONE and task_due < now:
                overdue.append(task.id)
        
        return overdue
    
    def calculate_risk_score(self) -> Tuple[int, str, Dict]:
        """
        Calculate project risk score (0-100).
        100 = perfect health, 0 = critical risk
        
        Returns: (score, level, factors breakdown)
        """
        score = 100
        factors = {}
        
        # Factor 1: Overdue tasks (-5 per task, max -25)
        overdue = self.detect_overdue_tasks()
        overdue_penalty = min(len(overdue) * 5, 25)
        score -= overdue_penalty
        factors['overdue'] = {
            'count': len(overdue),
            'penalty': overdue_penalty,
            'taskIds': overdue
        }
        
        # Factor 2: Blocked tasks (-8 per task, max -24)
        blocked = self.detect_blocked_tasks()
        blocked_penalty = min(len(blocked) * 8, 24)
        score -= blocked_penalty
        factors['blocked'] = {
            'count': len(blocked),
            'penalty': blocked_penalty,
            'taskIds': blocked
        }
        
        # Factor 3: Resource conflicts (-10 per conflict, max -20)
        conflicts = self.detect_resource_conflicts()
        conflict_penalty = min(len(conflicts) * 10, 20)
        score -= conflict_penalty
        factors['resource_conflicts'] = {
            'count': len(conflicts),
            'penalty': conflict_penalty
        }
        
        # Factor 4: Dependency chain depth (-2 per level beyond 3, max -16)
        max_depth = self._calculate_max_depth()
        depth_penalty = min(max(0, max_depth - 3) * 2, 16)
        score -= depth_penalty
        factors['dependency_depth'] = {
            'maxDepth': max_depth,
            'penalty': depth_penalty
        }
        
        # Factor 5: Low progress on near-deadline tasks (-3 per task, max -15)
        at_risk = self._detect_at_risk_tasks()
        at_risk_penalty = min(len(at_risk) * 3, 15)
        score -= at_risk_penalty
        factors['at_risk'] = {
            'count': len(at_risk),
            'penalty': at_risk_penalty,
            'taskIds': at_risk
        }
        
        # Ensure score is within bounds
        score = max(0, min(100, score))
        
        # Determine risk level
        if score >= 80:
            level = "low"
        elif score >= 60:
            level = "medium"
        elif score >= 40:
            level = "high"
        else:
            level = "critical"
        
        return score, level, factors
    
    def _calculate_max_depth(self) -> int:
        """Calculate maximum dependency chain depth"""
        if not self.dependencies:
            return 0
        
        depths: Dict[str, int] = {}
        
        def get_depth(task_id: str, visited: Set[str] = None) -> int:
            if visited is None:
                visited = set()
            
            if task_id in visited:
                return 0  # Cycle detected
            visited.add(task_id)
            
            if task_id in depths:
                return depths[task_id]
            
            deps = self.depends_on.get(task_id, [])
            if not deps:
                depths[task_id] = 0
            else:
                depths[task_id] = 1 + max(
                    (get_depth(d, visited.copy()) for d in deps if d in self.tasks),
                    default=0
                )
            
            return depths[task_id]
        
        for task_id in self.tasks:
            get_depth(task_id)
        
        return max(depths.values()) if depths else 0
    
    def _detect_at_risk_tasks(self) -> List[str]:
        """
        Find tasks due within 3 days that are still TODO.
        """
        now = now_utc()
        at_risk = []
        
        for task in self.tasks.values():
            if task.status == TaskStatus.TODO:
                task_due = normalize_datetime(task.due_date)
                days_until_due = (task_due - now).days
                if 0 <= days_until_due <= 3:
                    at_risk.append(task.id)
        
        return at_risk
    
    def generate_alerts(self) -> List[Alert]:
        """Generate alerts based on detected issues"""
        alerts = []
        
        # Overdue alerts
        overdue = self.detect_overdue_tasks()
        if overdue:
            for task_id in overdue[:3]:  # Limit to top 3
                task = self.tasks.get(task_id)
                if task:
                    task_due = normalize_datetime(task.due_date)
                    days_overdue = (now_utc() - task_due).days
                    alerts.append(Alert(
                        type="overdue",
                        severity="high" if days_overdue > 7 else "medium",
                        message=f"Task '{task.title}' is {days_overdue} days overdue",
                        taskIds=[task_id]
                    ))
        
        # Blocked task alerts
        blocked = self.detect_blocked_tasks()
        for task_id in blocked[:3]:
            task = self.tasks.get(task_id)
            deps = self.depends_on.get(task_id, [])
            blocking = [d for d in deps 
                       if self.tasks.get(d) and self.tasks[d].status != TaskStatus.DONE]
            if task and blocking:
                blocking_task = self.tasks.get(blocking[0])
                if blocking_task:
                    alerts.append(Alert(
                        type="blocked",
                        severity="medium",
                        message=f"'{task.title}' is blocked by '{blocking_task.title}'",
                        taskIds=[task_id, blocking[0]]
                    ))
        
        # Resource conflict alerts
        conflicts = self.detect_resource_conflicts()
        for conflict in conflicts[:2]:
            alerts.append(Alert(
                type="conflict",
                severity="medium",
                message=f"Resource overload: {len(conflict.taskIds)} overlapping tasks",
                taskIds=conflict.taskIds
            ))
        
        return alerts
    
    def generate_bottlenecks(self, critical_path: List[str]) -> List[Bottleneck]:
        """Identify bottleneck tasks on critical path"""
        bottlenecks = []
        
        for task_id in critical_path:
            task = self.tasks.get(task_id)
            if not task:
                continue
            
            # Tasks with many dependents are bottlenecks
            dependent_count = len(self.dependents.get(task_id, []))
            
            if dependent_count >= 2 or task.status == TaskStatus.TODO:
                if task.status != TaskStatus.DONE:
                    task_due = normalize_datetime(task.due_date)
                    days_until_due = (task_due - now_utc()).days
                    
                    if days_until_due < 0:
                        reason = f"Overdue by {abs(days_until_due)} days, blocking {dependent_count} tasks"
                        delay_impact = abs(days_until_due)
                    elif dependent_count >= 2:
                        reason = f"Critical path task blocking {dependent_count} downstream tasks"
                        delay_impact = max(1, 7 - days_until_due)
                    else:
                        continue
                    
                    bottlenecks.append(Bottleneck(
                        taskId=task_id,
                        taskTitle=task.title,
                        delayImpactDays=delay_impact,
                        reason=reason
                    ))
        
        return bottlenecks[:5]  # Top 5 bottlenecks
