import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details to start using Black Gate</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="name">Full Name</label>
              <Input id="name" type="text" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="document">CPF</label>
              {/* Note: In production we'll add a mask here */}
              <Input id="document" type="text" placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="password">Password</label>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full" type="submit">Create Account</Button>
            <div className="text-center text-sm text-text-secondary mt-4">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
