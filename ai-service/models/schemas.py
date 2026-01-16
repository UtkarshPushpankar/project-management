"""
Pydantic schemas for API request/response models
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class DependencyType(str, Enum):
    FINISH_TO_START = "FINISH_TO_START"
    START_TO_START = "START_TO_START"
    FINISH_TO_FINISH = "FINISH_TO_FINISH"


# ================================
# Input Schemas
# ================================

class TaskInput(BaseModel):
    """Task data for analysis"""
    id: str
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: Priority
    assigneeId: str
    assigneeName: Optional[str] = None
    due_date: datetime
    createdAt: datetime


class ProjectInput(BaseModel):
    """Project data for analysis"""
    id: str
    name: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tasks: List[TaskInput]
    existingDependencies: List["DependencyInput"] = []


class DependencyInput(BaseModel):
    """Existing dependency data"""
    id: str
    taskId: str
    dependsOnTaskId: str
    type: DependencyType = DependencyType.FINISH_TO_START


class AnalyzeRequest(BaseModel):
    """Request body for full analysis"""
    project: ProjectInput


# ================================
# Output Schemas
# ================================

class SuggestedDependency(BaseModel):
    """AI-suggested dependency"""
    taskId: str
    dependsOnTaskId: str
    type: DependencyType = DependencyType.FINISH_TO_START
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str


class Bottleneck(BaseModel):
    """Task causing delays"""
    taskId: str
    taskTitle: str
    delayImpactDays: int
    reason: str


class Alert(BaseModel):
    """Risk alert"""
    type: str  # "overdue", "blocked", "conflict", "critical_path"
    severity: str  # "low", "medium", "high", "critical"
    message: str
    taskIds: List[str] = []


class ResourceConflict(BaseModel):
    """Resource overload detection"""
    userId: str
    userName: Optional[str] = None
    taskIds: List[str]
    overlapDays: int


class RiskAnalysis(BaseModel):
    """Complete risk analysis result"""
    projectId: str
    riskScore: int = Field(ge=0, le=100)
    riskLevel: str  # "low", "medium", "high", "critical"
    criticalPathIds: List[str]
    bottlenecks: List[Bottleneck]
    alerts: List[Alert]
    suggestedDependencies: List[SuggestedDependency]
    resourceConflicts: List[ResourceConflict]
    analyzedAt: datetime


class AnalyzeResponse(BaseModel):
    """Response for full analysis"""
    success: bool
    analysis: Optional[RiskAnalysis] = None
    error: Optional[str] = None


class DependencyDetectionRequest(BaseModel):
    """Request for AI dependency detection"""
    tasks: List[TaskInput]


class DependencyDetectionResponse(BaseModel):
    """Response for dependency detection"""
    success: bool
    dependencies: List[SuggestedDependency] = []
    error: Optional[str] = None


class CriticalPathResponse(BaseModel):
    """Response for critical path calculation"""
    success: bool
    criticalPathIds: List[str] = []
    totalDays: int = 0
    error: Optional[str] = None


class RiskScoreResponse(BaseModel):
    """Response for risk score calculation"""
    success: bool
    riskScore: int = 0
    riskLevel: str = "low"
    factors: dict = {}
    error: Optional[str] = None
