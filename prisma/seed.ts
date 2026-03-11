import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});


async function main() {

  // Create Teacher
  const teacher = await prisma.teacher.create({
    data: {
      name: "John Smith",
      email: "teacher@example.com",
      password: "password123",
    }
  })

  // Create Quiz 1 with Questions
  const jsQuiz = await prisma.quiz.create({
    data: {
      title: "JavaScript Basics",
      teacherId: teacher.id,
      questions: {
        create: [
          {
            question: "Which language runs in the browser?",
            options: ["Java", "C", "Python", "JavaScript"],
            correctIndex: 3
          },
          {
            question: "What does JSON stand for?",
            options: [
              "JavaScript Object Notation",
              "Java Syntax Object Notation",
              "Java Standard Output Network",
              "None of the above"
            ],
            correctIndex: 0
          },
          {
            question: "Which company developed JavaScript?",
            options: ["Microsoft", "Netscape", "Google", "Apple"],
            correctIndex: 1
          }
        ]
      }
    }
  })

  // Create Quiz 2 with Questions
  const reactQuiz = await prisma.quiz.create({
    data: {
      title: "React Fundamentals",
      teacherId: teacher.id,
      questions: {
        create: [
          {
            question: "What hook is used for state in React?",
            options: ["useFetch", "useState", "useEffect", "useReducer"],
            correctIndex: 1
          },
          {
            question: "Who developed React?",
            options: ["Google", "Microsoft", "Facebook", "Twitter"],
            correctIndex: 2
          },
          {
            question: "What does JSX stand for?",
            options: [
              "JavaScript XML",
              "Java Syntax Extension",
              "JavaScript Extension",
              "JSON XML"
            ],
            correctIndex: 0
          }
        ]
      }
    }
  })

  // Add Submissions for Quiz 1
  await prisma.submission.createMany({
    data: [
      {
        quizId: jsQuiz.id,
        student: "Ali",
        score: 3
      },
      {
        quizId: jsQuiz.id,
        student: "Sara",
        score: 2
      },
      {
        quizId: jsQuiz.id,
        student: "Ahmed",
        score: 1
      }
    ]
  })

  // Add Submissions for Quiz 2
  await prisma.submission.createMany({
    data: [
      {
        quizId: reactQuiz.id,
        student: "Ali",
        score: 2
      },
      {
        quizId: reactQuiz.id,
        student: "Sara",
        score: 3
      }
    ]
  })

  console.log("✅ Database seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })