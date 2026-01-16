import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { data } = event
        await prisma.user.create({
            data: {
                id: data.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)

// Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-with-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { data } = event
        await prisma.user.delete({
            where: {
                id: data.id,
            }
        })
    }
)

// Inngest function to update user data in database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { data } = event
        await prisma.user.update({
            where: {
                id: data.id
            },
            data: {
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)

// Inngest function to save workspace data to a database
const syncWorkspaceCreation = inngest.createFunction(
    { id: 'sync-workspace-from-clerk' },
    { event: 'clerk/organization.created' },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.create({
            data: {
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by,
                image_url: data.image_url,
            }
        })

        // Add creator as ADMIN number
        await prisma.workspaceMember.create({
            data: {
                userId: data.created_by,
                workspaceId: data.id,
                role: "ADMIN"
            }
        })
    }
)

// Inngest function to update workspace data in database 
const syncWorkspaceUpdation = inngest.createFunction(
    { id: 'update-workspace-from-clerk' },
    { event: 'clerk/organization.updated' },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.update({
            where: {
                id: data.id
            },
            data: {
                name: data.name,
                slug: data.slug,
                image_url: data.image_url,
            }
        })
    }
)

// Inngest function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction(
    { id: 'delete-workspace-with-clerk' },
    { event: 'clerk/organization.deleted' },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.delete({
            where: {
                id: data.id
            }
        })
    }
)

// Inngest function to save workspace member data to a database 
const syncWorkspaceMemberCreation = inngest.createFunction(
    { id: 'sync-workspace-member-from-clerk' },
    { event: 'clerk/organizationInvitation.accepted' },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspaceMember.create({
            data: {
                userId: data.user_id,
                workspaceId: data.organization_id,
                role: data.role_name === "org:admin" ? "ADMIN" : "MEMBER",
            }
        })
    }
)

// Inngest Function to Send Email on Task Creation 
const sendTaskAssignmentEmail = inngest.createFunction(
    { id: "send-task-assignment-mail" },
    { event: "app/task.assigned" },
    async ({ event, step }) => {
        const { taskId, origin } = event.data;

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { assignee: true, project: true }
        })

        await sendEmail({
            to: task.assignee.email,
            subject: `New Task Assignment in ${task.project.name}`,
            body: `<div style="max-width: 600px;">
                    <h2>Hi ${task.assignee.name}, 👋</h2>

                    <p style="font-size: 16px;">You've been assigned a new task:</p>

                    <p
                        style="
                        font-size: 18px;
                        font-weight: bold;
                        color: #007bff;
                        margin: 8px 0;
                        "
                    >
                        ${task.title}
                    </p>

                    <div
                        style="
                        border: 1px solid #ddd;
                        padding: 12px 16px;
                        border-radius: 6px;
                        margin-bottom: 30px;
                        "
                    >
                        <p style="margin: 6px 0;">
                        <strong>Description:</strong> ${task.description}
                        </p>

                        <p style="margin: 6px 0;">
                        <strong>Due Date:</strong>
                        ${new Date(task.due_date).toLocaleDateString()}
                        </p>
                    </div>

                    <a
                        href="${origin}"
                        style="
                        background-color: #007bff;
                        padding: 12px 24px;
                        border-radius: 5px;
                        color: #fff;
                        font-weight: 600;
                        font-size: 16px;
                        text-decoration: none;
                        display: inline-block;
                        "
                    >
                        View Task
                    </a>

                    <p
                        style="
                        margin-top: 20px;
                        font-size: 14px;
                        color: #6c757d;
                        "
                    >
                        Please make sure to review and complete it before the due date.
                    </p>
                    </div>`
        })

        if (new Date(task.due_date).toLocaleDateString() !== new Date().toDateString()) {
            await step.sleepUntil('wait-for-the-due-date', new Date(task.due_date));

            await step.run('check-if-task-is-completed', async () => {
                const task = await prisma.task.findUnique({
                    where: { id: taskId },
                    include: { assignee: true, project: true }
                })

                if (!task) return;

                if (task.status !== "DONE") {
                    await step.run('send-task-reminder-mail', async () => {
                        await sendEmail({
                            to: task.assignee.email,
                            subject: `Reminder for ${task.project.name}`,
                            body: `<div style="max-width: 600px;">
                                    <h2>Hi ${task.assignee.name}, 👋</h2>

                                    <p style="font-size: 16px;">
                                        You have a task due in ${task.project.name}:
                                    </p>

                                    <p
                                        style="
                                        font-size: 18px;
                                        font-weight: bold;
                                        color: #007bff;
                                        margin: 8px 0;
                                        "
                                    >
                                        ${task.title}
                                    </p>

                                    <div
                                        style="
                                        border: 1px solid #ddd;
                                        padding: 12px 16px;
                                        border-radius: 6px;
                                        margin-bottom: 30px;
                                        "
                                    >
                                        <p style="margin: 6px 0;">
                                        <strong>Description:</strong> ${task.description}
                                        </p>

                                        <p style="margin: 6px 0;">
                                        <strong>Due Date:</strong>
                                        ${new Date(task.due_date).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <a
                                        href="${origin}"
                                        style="
                                        background-color: #007bff;
                                        padding: 12px 24px;
                                        border-radius: 5px;
                                        color: #fff;
                                        font-weight: 600;
                                        font-size: 16px;
                                        text-decoration: none;
                                        display: inline-block;
                                        "
                                    >
                                        View Task
                                    </a>

                                    <p
                                        style="
                                        margin-top: 20px;
                                        font-size: 14px;
                                        color: #6c757d;
                                        "
                                    >
                                        Please make sure to review and complete it before the due date.
                                    </p>
                                    </div>`
                        })
                    })
                }
            })
        }
    }
)

// ================================
// AI Dependency Brain Functions
// ================================

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Daily cron job to analyze all active projects
 * Runs at 6 AM every day
 */
const dailyProjectAnalysis = inngest.createFunction(
    {
        id: 'daily-ai-project-analysis',
        retries: 1
    },
    { cron: '0 6 * * *' }, // 6 AM daily
    async ({ step }) => {
        // Get all active projects
        const projects = await step.run('fetch-active-projects', async () => {
            return await prisma.project.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true, name: true }
            });
        });

        console.log(`🧠 Daily AI Analysis: Processing ${projects.length} projects`);

        // Analyze each project
        for (const project of projects) {
            await step.run(`analyze-${project.id}`, async () => {
                try {
                    // Fetch project details
                    const projectData = await prisma.project.findUnique({
                        where: { id: project.id },
                        include: {
                            tasks: {
                                include: { assignee: true }
                            }
                        }
                    });

                    if (!projectData || projectData.tasks.length < 2) {
                        return { skipped: true, reason: 'Not enough tasks' };
                    }

                    // Get existing dependencies
                    const taskIds = projectData.tasks.map(t => t.id);
                    const existingDeps = await prisma.taskDependency.findMany({
                        where: { taskId: { in: taskIds } }
                    });

                    // Call AI service
                    const response = await fetch(`${AI_SERVICE_URL}/api/v1/analyze`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            project: {
                                id: projectData.id,
                                name: projectData.name,
                                description: projectData.description,
                                start_date: projectData.start_date,
                                end_date: projectData.end_date,
                                tasks: projectData.tasks.map(t => ({
                                    id: t.id,
                                    title: t.title,
                                    description: t.description,
                                    status: t.status,
                                    priority: t.priority,
                                    assigneeId: t.assigneeId,
                                    assigneeName: t.assignee?.name,
                                    due_date: t.due_date,
                                    createdAt: t.createdAt
                                })),
                                existingDependencies: existingDeps.map(d => ({
                                    id: d.id,
                                    taskId: d.taskId,
                                    dependsOnTaskId: d.dependsOnTaskId,
                                    type: d.type
                                }))
                            }
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Save analysis
                        await prisma.projectRiskAnalysis.create({
                            data: {
                                projectId: project.id,
                                riskScore: result.analysis.riskScore,
                                riskLevel: result.analysis.riskLevel,
                                criticalPathIds: result.analysis.criticalPathIds,
                                bottlenecks: result.analysis.bottlenecks,
                                alerts: result.analysis.alerts,
                                suggestions: result.analysis.suggestedDependencies
                            }
                        });

                        return {
                            success: true,
                            riskScore: result.analysis.riskScore
                        };
                    }

                    return { success: false, error: result.error };
                } catch (error) {
                    console.error(`Analysis failed for ${project.name}:`, error);
                    return { success: false, error: error.message };
                }
            });
        }

        return { analyzed: projects.length };
    }
);

/**
 * Trigger analysis when a task is significantly updated
 * Listens for task status, due_date, or assignee changes
 */
const analyzeOnTaskChange = inngest.createFunction(
    {
        id: 'analyze-on-task-change',
        retries: 0,
        debounce: {
            period: '5m', // Wait 5 minutes for more changes
            key: 'event.data.projectId'
        }
    },
    { event: 'app/task.changed' },
    async ({ event, step }) => {
        const { projectId } = event.data;

        await step.run('trigger-analysis', async () => {
            try {
                // Get project with tasks
                const project = await prisma.project.findUnique({
                    where: { id: projectId },
                    include: {
                        tasks: {
                            include: { assignee: true }
                        }
                    }
                });

                if (!project || project.tasks.length < 2) {
                    return { skipped: true };
                }

                const taskIds = project.tasks.map(t => t.id);
                const existingDeps = await prisma.taskDependency.findMany({
                    where: { taskId: { in: taskIds } }
                });

                const response = await fetch(`${AI_SERVICE_URL}/api/v1/risk/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        project: {
                            id: project.id,
                            name: project.name,
                            tasks: project.tasks.map(t => ({
                                id: t.id,
                                title: t.title,
                                description: t.description,
                                status: t.status,
                                priority: t.priority,
                                assigneeId: t.assigneeId,
                                assigneeName: t.assignee?.name,
                                due_date: t.due_date,
                                createdAt: t.createdAt
                            })),
                            existingDependencies: existingDeps
                        }
                    })
                });

                const result = await response.json();

                if (result.success) {
                    return { riskScore: result.riskScore };
                }

                return { error: result.error };
            } catch (error) {
                console.error('Task change analysis failed:', error);
                return { error: error.message };
            }
        });
    }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    syncWorkspaceCreation,
    syncWorkspaceUpdation,
    syncWorkspaceDeletion,
    syncWorkspaceMemberCreation,
    sendTaskAssignmentEmail,
    dailyProjectAnalysis,
    analyzeOnTaskChange
];