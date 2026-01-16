import express from "express";
import axios from "axios";
import prisma from "../configs/prisma.js";

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Helper: Fetch project with all tasks and existing dependencies
 */
async function getProjectWithDetails(projectId) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            tasks: {
                include: {
                    assignee: true,
                    dependencies: true,
                    dependents: true
                }
            },
            members: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!project) {
        throw new Error("Project not found");
    }

    // Get all dependencies for this project's tasks
    const taskIds = project.tasks.map(t => t.id);
    const existingDependencies = await prisma.taskDependency.findMany({
        where: {
            OR: [
                { taskId: { in: taskIds } },
                { dependsOnTaskId: { in: taskIds } }
            ]
        }
    });

    return { project, existingDependencies };
}

/**
 * Helper: Format project data for Python AI service
 */
function formatProjectForAI(project, existingDependencies) {
    return {
        id: project.id,
        name: project.name,
        description: project.description,
        start_date: project.start_date,
        end_date: project.end_date,
        tasks: project.tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId,
            assigneeName: task.assignee?.name,
            due_date: task.due_date,
            createdAt: task.createdAt
        })),
        existingDependencies: existingDependencies.map(dep => ({
            id: dep.id,
            taskId: dep.taskId,
            dependsOnTaskId: dep.dependsOnTaskId,
            type: dep.type
        }))
    };
}

/**
 * POST /api/ai/analyze/:projectId
 * Trigger full AI analysis for a project
 */
router.post("/analyze/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = await req.auth();

        const { project, existingDependencies } = await getProjectWithDetails(projectId);

        // Check user has access to project
        const isMember = project.team_lead === userId ||
            project.members.some(m => m.userId === userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Call Python AI service
        const formattedProject = formatProjectForAI(project, existingDependencies);

        const response = await axios.post(
            `${AI_SERVICE_URL}/api/v1/analyze`,
            { project: formattedProject },
            { timeout: 30000 }
        );

        if (!response.data.success) {
            return res.status(500).json({
                message: "Analysis failed",
                error: response.data.error
            });
        }

        const analysis = response.data.analysis;

        // Save analysis to database
        await prisma.projectRiskAnalysis.create({
            data: {
                projectId: project.id,
                riskScore: analysis.riskScore,
                riskLevel: analysis.riskLevel,
                criticalPathIds: analysis.criticalPathIds,
                bottlenecks: analysis.bottlenecks,
                alerts: analysis.alerts,
                suggestions: analysis.suggestedDependencies
            }
        });

        // Save AI-suggested dependencies (as suggestions, not confirmed)
        for (const suggestion of analysis.suggestedDependencies) {
            // Check if dependency already exists
            const existing = await prisma.taskDependency.findUnique({
                where: {
                    taskId_dependsOnTaskId: {
                        taskId: suggestion.taskId,
                        dependsOnTaskId: suggestion.dependsOnTaskId
                    }
                }
            });

            if (!existing) {
                await prisma.taskDependency.create({
                    data: {
                        taskId: suggestion.taskId,
                        dependsOnTaskId: suggestion.dependsOnTaskId,
                        type: suggestion.type || "FINISH_TO_START",
                        confidence: suggestion.confidence,
                        isAISuggested: true,
                        acceptedByUser: null // Pending user review
                    }
                });
            }
        }

        res.json({
            success: true,
            analysis: {
                riskScore: analysis.riskScore,
                riskLevel: analysis.riskLevel,
                criticalPathIds: analysis.criticalPathIds,
                bottlenecks: analysis.bottlenecks,
                alerts: analysis.alerts,
                suggestedDependencies: analysis.suggestedDependencies,
                resourceConflicts: analysis.resourceConflicts
            }
        });

    } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({
            message: error.message || "Analysis failed",
            error: error.response?.data?.error
        });
    }
});

/**
 * GET /api/ai/risk/:projectId
 * Get latest risk analysis for a project
 */
router.get("/risk/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = await req.auth();

        // Verify access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isMember = project.team_lead === userId ||
            project.members.some(m => m.userId === userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Get latest analysis
        const analysis = await prisma.projectRiskAnalysis.findFirst({
            where: { projectId },
            orderBy: { analyzedAt: 'desc' }
        });

        if (!analysis) {
            return res.json({
                hasAnalysis: false,
                message: "No analysis found. Run an analysis first."
            });
        }

        res.json({
            hasAnalysis: true,
            analysis
        });

    } catch (error) {
        console.error("Get risk error:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/ai/dependencies/:projectId
 * Get all dependencies for a project
 */
router.get("/dependencies/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = await req.auth();

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: true,
                members: true
            }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isMember = project.team_lead === userId ||
            project.members.some(m => m.userId === userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        const taskIds = project.tasks.map(t => t.id);

        const dependencies = await prisma.taskDependency.findMany({
            where: {
                taskId: { in: taskIds }
            },
            include: {
                task: true,
                dependsOn: true
            }
        });

        res.json({
            confirmed: dependencies.filter(d => d.acceptedByUser === true || !d.isAISuggested),
            pending: dependencies.filter(d => d.isAISuggested && d.acceptedByUser === null),
            rejected: dependencies.filter(d => d.acceptedByUser === false)
        });

    } catch (error) {
        console.error("Get dependencies error:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/ai/dependencies
 * Create a manual dependency
 */
router.post("/dependencies", async (req, res) => {
    try {
        const { taskId, dependsOnTaskId, type = "FINISH_TO_START" } = req.body;
        const { userId } = await req.auth();

        if (!taskId || !dependsOnTaskId) {
            return res.status(400).json({
                message: "taskId and dependsOnTaskId are required"
            });
        }

        if (taskId === dependsOnTaskId) {
            return res.status(400).json({
                message: "A task cannot depend on itself"
            });
        }

        // Verify both tasks exist and user has access
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { members: true } } }
        });

        const dependsOnTask = await prisma.task.findUnique({
            where: { id: dependsOnTaskId }
        });

        if (!task || !dependsOnTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.projectId !== dependsOnTask.projectId) {
            return res.status(400).json({
                message: "Both tasks must be in the same project"
            });
        }

        const isMember = task.project.team_lead === userId ||
            task.project.members.some(m => m.userId === userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Check for existing dependency
        const existing = await prisma.taskDependency.findUnique({
            where: {
                taskId_dependsOnTaskId: { taskId, dependsOnTaskId }
            }
        });

        if (existing) {
            return res.status(400).json({
                message: "Dependency already exists"
            });
        }

        // Create dependency
        const dependency = await prisma.taskDependency.create({
            data: {
                taskId,
                dependsOnTaskId,
                type,
                confidence: 1.0,
                isAISuggested: false,
                acceptedByUser: true
            },
            include: {
                task: true,
                dependsOn: true
            }
        });

        res.json({
            success: true,
            dependency
        });

    } catch (error) {
        console.error("Create dependency error:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * PATCH /api/ai/dependencies/:id/accept
 * Accept an AI-suggested dependency
 */
router.patch("/dependencies/:id/accept", async (req, res) => {
    try {
        const { id } = req.params;

        const dependency = await prisma.taskDependency.update({
            where: { id },
            data: { acceptedByUser: true },
            include: { task: true, dependsOn: true }
        });

        res.json({ success: true, dependency });

    } catch (error) {
        console.error("Accept dependency error:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * PATCH /api/ai/dependencies/:id/reject
 * Reject an AI-suggested dependency
 */
router.patch("/dependencies/:id/reject", async (req, res) => {
    try {
        const { id } = req.params;

        const dependency = await prisma.taskDependency.update({
            where: { id },
            data: { acceptedByUser: false },
            include: { task: true, dependsOn: true }
        });

        res.json({ success: true, dependency });

    } catch (error) {
        console.error("Reject dependency error:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * DELETE /api/ai/dependencies/:id
 * Delete a dependency
 */
router.delete("/dependencies/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.taskDependency.delete({
            where: { id }
        });

        res.json({ success: true });

    } catch (error) {
        console.error("Delete dependency error:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/internal/risk-alert (internal use by Python service)
 * Send risk alert email
 */
router.post("/internal/risk-alert", async (req, res) => {
    try {
        const { projectId, projectName, riskScore, riskLevel } = req.body;

        // Get project owner/team lead
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { owner: true }
        });

        if (!project || !project.owner) {
            return res.status(404).json({ message: "Project or owner not found" });
        }

        // Import nodemailer config
        const { default: sendEmail } = await import("../configs/nodemailer.js");

        await sendEmail({
            to: project.owner.email,
            subject: `⚠️ Risk Alert: ${projectName} - Score ${riskScore}/100`,
            body: `
                <div style="max-width: 600px; font-family: sans-serif;">
                    <h2 style="color: ${riskLevel === 'critical' ? '#dc2626' : '#f59e0b'};">
                        🚨 Project Risk Alert
                    </h2>
                    
                    <p>Your project <strong>${projectName}</strong> has a concerning risk score:</p>
                    
                    <div style="
                        background: ${riskLevel === 'critical' ? '#fee2e2' : '#fef3c7'};
                        border-radius: 12px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    ">
                        <div style="font-size: 48px; font-weight: bold; color: ${riskLevel === 'critical' ? '#dc2626' : '#f59e0b'};">
                            ${riskScore}
                        </div>
                        <div style="font-size: 14px; color: #666;">
                            Risk Score (${riskLevel.toUpperCase()})
                        </div>
                    </div>
                    
                    <p>Review your project to address:</p>
                    <ul>
                        <li>Overdue tasks</li>
                        <li>Blocked dependencies</li>
                        <li>Resource conflicts</li>
                    </ul>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/projectsDetail?id=${projectId}"
                       style="
                           display: inline-block;
                           background: linear-gradient(to right, #8b5cf6, #06b6d4);
                           color: white;
                           padding: 12px 24px;
                           border-radius: 8px;
                           text-decoration: none;
                           font-weight: 600;
                       ">
                        View Project Analysis
                    </a>
                </div>
            `
        });

        res.json({ success: true });

    } catch (error) {
        console.error("Risk alert error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
