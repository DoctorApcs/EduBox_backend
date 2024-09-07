import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { ResponsiveBar } from "@nivo/bar"
import { ResponsiveLine } from "@nivo/line"

export default function Component() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 p-4 bg-white border-r">
        <div className="flex items-center mb-6">
          <Input type="search" placeholder="Search your courses, activities, knowledge ..." className="w-full" />
        </div>
        <nav className="space-y-4">
          <Link href="#" className="flex items-center text-purple-600" prefetch={false}>
            <HomeIcon className="w-6 h-6 mr-2" />
            Dashboard
          </Link>
          <Link href="#" className="flex items-center text-gray-600" prefetch={false}>
            <BookIcon className="w-6 h-6 mr-2" />
            Courses
          </Link>
          <Link href="#" className="flex items-center text-gray-600" prefetch={false}>
            <WebcamIcon className="w-6 h-6 mr-2" />
            Chat
          </Link>
          <Link href="#" className="flex items-center text-gray-600" prefetch={false}>
            <BarChartIcon className="w-6 h-6 mr-2" />
            Analytic
          </Link>
        </nav>
        <div className="mt-auto space-y-4">
          <Link href="#" className="flex items-center text-gray-600" prefetch={false}>
            <SettingsIcon className="w-6 h-6 mr-2" />
            Settings
          </Link>
          <Link href="#" className="flex items-center text-red-600" prefetch={false}>
            <LogOutIcon className="w-6 h-6 mr-2" />
            Logout
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <div className="flex items-center justify-between p-6 bg-purple-600 rounded-lg">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back, admin!</h2>
            <p className="text-white">You are doing great! Keep it up</p>
          </div>
          <div
            className="w-32 h-32 bg-cover bg-center"
            style={{ backgroundImage: "url('/placeholder.svg?height=128&width=128')" }}
          />
        </div>
        <section className="mt-6">
          <h3 className="text-xl font-bold">Your Courses</h3>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Card className="relative">
              <div className="absolute top-2 right-2">
                <ArrowUpRightIcon className="w-6 h-6 text-white bg-purple-600 rounded-full p-1" />
              </div>
              <div
                className="w-full h-32 bg-cover bg-center"
                style={{ backgroundImage: "url('/placeholder.svg?height=128&width=128')" }}
              />
              <div className="p-4">
                <h4 className="font-bold">Calculus 3</h4>
                <p className="text-gray-600">2 Documents</p>
              </div>
            </Card>
            <Card className="relative">
              <div className="absolute top-2 right-2">
                <ArrowUpRightIcon className="w-6 h-6 text-white bg-purple-600 rounded-full p-1" />
              </div>
              <div
                className="w-full h-32 bg-cover bg-center"
                style={{ backgroundImage: "url('/placeholder.svg?height=128&width=128')" }}
              />
              <div className="p-4">
                <h4 className="font-bold">CS305</h4>
                <p className="text-gray-600">10 Docs</p>
              </div>
            </Card>
            <Card className="flex items-center justify-center border-2 border-dashed border-purple-600">
              <PlusIcon className="w-12 h-12 text-purple-600" />
            </Card>
          </div>
        </section>
        <section className="mt-6">
          <h3 className="text-xl font-bold">Recent Activities</h3>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Card className="flex items-center p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                <FileTextIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h4 className="font-bold">Final Revision</h4>
                <p className="text-gray-600">Calculus 3</p>
                <p className="text-gray-400 text-sm">45mins ago</p>
              </div>
              <div className="ml-auto">
                <ArrowRightIcon className="w-6 h-6 text-gray-600" />
              </div>
            </Card>
            <Card className="flex items-center p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                <FileTextIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h4 className="font-bold">Final Revision</h4>
                <p className="text-gray-600">Calculus 3</p>
                <p className="text-gray-400 text-sm">45mins ago</p>
              </div>
              <div className="ml-auto">
                <ArrowRightIcon className="w-6 h-6 text-gray-600" />
              </div>
            </Card>
            <Card className="flex items-center justify-center p-4">
              <div
                className="w-32 h-32 bg-cover bg-center"
                style={{ backgroundImage: "url('/placeholder.svg?height=128&width=128')" }}
              />
              <div className="ml-4">
                <h4 className="font-bold">Mind map</h4>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <aside className="w-64 p-4 bg-white border-l">
        <div className="flex flex-col items-center">
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <h4 className="mt-4 font-bold">Admin</h4>
          <Badge variant="secondary" className="mt-2">
            Pro
          </Badge>
        </div>
        <div className="mt-6">
          <BarChart className="w-full h-32" />
        </div>
        <div className="mt-6">
          <h4 className="font-bold">Calendar</h4>
          <Calendar mode="single" className="border rounded-md mt-2" />
        </div>
      </aside>
    </div>
  )
}

function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}


function ArrowUpRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  )
}


function BarChart(props) {
  return (
    <div {...props}>
      <ResponsiveBar
        data={[
          { name: "Jan", count: 111 },
          { name: "Feb", count: 157 },
          { name: "Mar", count: 129 },
          { name: "Apr", count: 150 },
          { name: "May", count: 119 },
          { name: "Jun", count: 72 },
        ]}
        keys={["count"]}
        indexBy="name"
        margin={{ top: 0, right: 0, bottom: 40, left: 40 }}
        padding={0.3}
        colors={["#2563eb"]}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 4,
          tickPadding: 16,
        }}
        gridYValues={4}
        theme={{
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: {
              stroke: "#f3f4f6",
            },
          },
        }}
        tooltipLabel={({ id }) => `${id}`}
        enableLabel={false}
        role="application"
        ariaLabel="A bar chart showing data"
      />
    </div>
  )
}


function BarChartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  )
}


function BookIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}


function FileTextIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}


function HomeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}


function LineChart(props) {
  return (
    <div {...props}>
      <ResponsiveLine
        data={[
          {
            id: "Desktop",
            data: [
              { x: "Jan", y: 43 },
              { x: "Feb", y: 137 },
              { x: "Mar", y: 61 },
              { x: "Apr", y: 145 },
              { x: "May", y: 26 },
              { x: "Jun", y: 154 },
            ],
          },
          {
            id: "Mobile",
            data: [
              { x: "Jan", y: 60 },
              { x: "Feb", y: 48 },
              { x: "Mar", y: 177 },
              { x: "Apr", y: 78 },
              { x: "May", y: 96 },
              { x: "Jun", y: 204 },
            ],
          },
        ]}
        margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
        xScale={{
          type: "point",
        }}
        yScale={{
          type: "linear",
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 5,
          tickPadding: 16,
        }}
        colors={["#2563eb", "#e11d48"]}
        pointSize={6}
        useMesh={true}
        gridYValues={6}
        theme={{
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: {
              stroke: "#f3f4f6",
            },
          },
        }}
        role="application"
      />
    </div>
  )
}


function LogOutIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}


function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}


function SettingsIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}


function WebcamIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="10" r="8" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 22h10" />
      <path d="M12 22v-4" />
    </svg>
  )
}