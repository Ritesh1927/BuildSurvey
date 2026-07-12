"use client"

import { useState } from "react"
import { 
  Mic, Upload, Play, Pause, Square, Clock, Calendar, 
  FileText, Trash2, Download, Search, MoreHorizontal, 
  CheckCircle2, AlertCircle, Link2
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

const voiceNotes = [
  {
    id: 1,
    title: "Foundation Observation Notes - East Section",
    project: "Riverside Tower Complex",
    survey: "SUR-001",
    surveyTitle: "Foundation Inspection - Phase 1",
    duration: "1:45",
    date: "2026-07-08",
    time: "09:20 AM",
    size: "1.2 MB",
    transcription: "Noticed hairline cracks along the east foundation wall, approximately 2mm width. The cracks appear to be surface-level but recommend further investigation with a crack monitor. Soil moisture levels seem normal in this section. Foundation concrete appears to be in good condition overall.",
    status: "transcribed",
  },
  {
    id: 2,
    title: "Safety Concerns - Temporary Shoring",
    project: "Downtown Mall Expansion",
    survey: "SUR-004",
    surveyTitle: "Fire Safety Compliance Check",
    duration: "0:58",
    date: "2026-07-06",
    time: "11:30 AM",
    size: "0.8 MB",
    transcription: "Temporary shoring appears adequate but recommend additional bracing before next concrete pour. Need to verify load calculations with structural engineer. Current shoring spacing is approximately 1.2m which is within acceptable range.",
    status: "transcribed",
  },
  {
    id: 3,
    title: "Plumbing Assessment - Main Supply Line",
    project: "Metro Residential Towers",
    survey: "SUR-003",
    surveyTitle: "Plumbing Network Assessment",
    duration: "2:30",
    date: "2026-07-05",
    time: "10:15 AM",
    size: "1.8 MB",
    transcription: "Main water supply line shows signs of corrosion at junction points. Pipe diameter is 150mm cast iron, estimated age 15 years. Recommend CCTV inspection of entire supply network. Water pressure test shows 4.5 bar at ground level, within acceptable parameters.",
    status: "transcribed",
  },
  {
    id: 4,
    title: "HVAC Ductwork Routing Notes",
    project: "Green Valley Office Park",
    survey: "SUR-008",
    surveyTitle: "HVAC System Inspection",
    duration: "3:12",
    date: "2026-07-03",
    time: "01:30 PM",
    size: "2.3 MB",
    transcription: "Ductwork routing conflicts with electrical conduit at grid intersection C-4. Requires coordination between MEP trades. Duct insulation appears to be in good condition. Air handling unit capacity appears adequate for the designed occupancy load.",
    status: "transcribed",
  },
  {
    id: 5,
    title: "Emergency Exit Documentation",
    project: "Downtown Mall Expansion",
    survey: "SUR-004",
    surveyTitle: "Fire Safety Compliance Check",
    duration: "1:20",
    date: "2026-07-06",
    time: "11:00 AM",
    size: "0.9 MB",
    transcription: "",
    status: "pending",
  },
  {
    id: 6,
    title: "Rebar Placement Observations",
    project: "Riverside Tower Complex",
    survey: "SUR-001",
    surveyTitle: "Foundation Inspection - Phase 1",
    duration: "2:05",
    date: "2026-07-08",
    time: "10:00 AM",
    size: "1.5 MB",
    transcription: "Rebar placement at column foundation appears correct per drawings. 16mm Fe500D bars at 150mm spacing. Adequate cover of 50mm confirmed. Lap length appears sufficient at 40d. Need to verify stirrup spacing at beam-column junction.",
    status: "transcribed",
  },
]

export default function VoiceNotesPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNotes = voiceNotes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.transcription.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voice Notes"
        description="Record and manage audio observations from site surveys"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Media", href: "/media" },
          { label: "Voice Notes" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => document.getElementById("voice-upload-input")?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Recording
            </Button>
            <input
              id="voice-upload-input"
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const count = e.target.files.length
                  import("@/components/ui/toast").then(({ showSuccess }) => {
                    showSuccess(`${count} recording(s) uploaded successfully`)
                  })
                  e.target.value = ""
                }
              }}
            />
          </div>
        }
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <h3 className="font-medium">Voice Recorder</h3>
              <p className="text-sm text-muted-foreground">
                {isRecording ? "Recording in progress..." : "Click to start recording"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="icon"
                className="h-16 w-16 rounded-full"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <Square className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span>00:00:45</span>
                <span>•</span>
                <span>Recording to: Foundation Inspection - Phase 1</span>
              </div>
            )}
            <div className="w-full max-w-md h-12 flex items-center justify-center gap-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full ${isRecording ? "bg-primary" : "bg-primary/30"}`}
                  style={{
                    height: isRecording
                      ? `${Math.random() * 40 + 8}px`
                      : `${Math.random() * 16 + 4}px`,
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search voice notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredNotes.length} voice notes
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Button
                      variant={playingId === note.id ? "default" : "outline"}
                      size="icon"
                      className="h-10 w-10 rounded-full shrink-0"
                      onClick={() =>
                        setPlayingId(playingId === note.id ? null : note.id)
                      }
                    >
                      {playingId === note.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <h3 className="font-medium">{note.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{note.project}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          {note.survey}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="h-10 flex items-center gap-0.5 px-2">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-0.5 rounded-full ${
                        playingId === note.id ? "bg-primary" : "bg-primary/30"
                      }`}
                      style={{
                        height: `${Math.random() * 32 + 4}px`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {note.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {note.date} at {note.time}
                  </span>
                  <span>{note.size}</span>
                  <Badge variant={note.status === "transcribed" ? "success" : "warning"} className="text-[10px]">
                    {note.status === "transcribed" ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" /> Transcribed</>
                    ) : (
                      <><AlertCircle className="h-3 w-3 mr-1" /> Pending</>
                    )}
                  </Badge>
                </div>

                {note.transcription && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                      <FileText className="h-3 w-3" />
                      Transcription
                    </div>
                    <p className="text-sm">{note.transcription}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
