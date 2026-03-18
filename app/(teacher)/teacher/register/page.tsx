import { SignUp } from "@clerk/nextjs";

export default function TeacherRegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <SignUp signInUrl="/auth/login" />
    </main>
  );
}
