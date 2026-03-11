import prisma from "@/lib/prisma";

export const getAllTeachers = async () => {
    return await prisma.teacher.findMany({
        include: {
            quizzes: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const addTeacher = async (name: string, email: string, password: string) => {
    return await prisma.teacher.create({
        data: {
            name,
            email,
            password,
        },
    });
};
