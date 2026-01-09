import prisma from "../configs/prisma.js";
import { clerkClient } from "@clerk/express";

// Get all workspaces for user 
export const getUserWorkspaces = async (req, res) => {
    try {
        const { userId, orgId, orgRole } = req.auth();

        // Sync membership: If user is in a Clerk org but not in DB, add them
        if (orgId) {
            const existingMembership = await prisma.workspaceMember.findUnique({
                where: { userId_workspaceId: { userId, workspaceId: orgId } }
            });

            if (!existingMembership) {
                // Check if workspace exists in our database
                const workspace = await prisma.workspace.findUnique({ where: { id: orgId } });

                if (workspace) {
                    // Add user as member (map Clerk role to our role)
                    const role = orgRole === "org:admin" ? "ADMIN" : "MEMBER";
                    await prisma.workspaceMember.create({
                        data: { userId, workspaceId: orgId, role }
                    });
                }
            }
        }

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: { some: { userId: userId } }
            },
            include: {
                members: { include: { user: true } },
                projects: {
                    include: {
                        tasks: {
                            include: {
                                assignee: true, comments: {
                                    include: { user: true }
                                }
                            }
                        },
                        members: { include: { user: true } }
                    }
                },
                owner: true
            }
        });
        res.json({ workspaces })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

// Add member to workspace 
export const addMember = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { email, role, workspaceId, message } = req.body;

        // check if user exists 
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (!workspaceId || !role) {
            return res.status(400).json({ message: "Missing required parameters" })
        }

        if (!["ADMIN", "MEMBER"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" })
        }

        // fetch workspace 
        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, include: { members: true } })

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" })
        }

        // check creator has admin role
        if (!workspace.members.find((member) => member.userId === userId && member.role === "ADMIN")) {
            return res.status(401).json({ message: "You do not have admin privileges" })
        }

        // check if user is already a member
        const existingMember = workspace.members.find((member) => member.userId === userId);

        if (existingMember) {
            return res.status(400).json({ message: "User is already a member" })
        }

        const member = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId,
                role,
                message
            }
        })

        res.json({ member, message: "Member added successfully" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
}