import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <Label htmlFor="example-input">Example Input</Label>
          <Input id="example-input" placeholder="Type something..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="example-textarea">Example Textarea</Label>
          <Textarea id="example-textarea" placeholder="Write something..." />
        </div>

        <div className="space-y-2">
          <Label>Buttons Showcase</Label>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="failure">Failure</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="success">Success</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
