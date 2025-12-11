"use client"

import { useEffect, useState } from "react"
import { EmailTemplateList } from "@/features/email-template-builder"

/**
 * Email Templates List Page
 * Route: /admin/[resortName]/template-builder
 *
 * Displays all email templates and provides actions to edit and delete them
 */
export default function TemplatesPage({
  params,
}: {
  params: Promise<{ resortName: string }>
}) {
  const [resortName, setResortName] = useState<string>("")

  useEffect(() => {
    params.then((unwrappedParams) => {
      setResortName(unwrappedParams.resortName)
    })
  }, [params])

  if (!resortName) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return <EmailTemplateList resortName={resortName} />
}
