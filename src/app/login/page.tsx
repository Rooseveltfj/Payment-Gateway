import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="email">Email or CPF</label>
              <Input id="email" type="text" placeholder="m@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary" htmlFor="password">Password</label>
                <Link href="/forgot" className="text-sm text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full" type="submit">Sign In</Button>
            <div className="text-center text-sm text-text-secondary mt-4">
              Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
