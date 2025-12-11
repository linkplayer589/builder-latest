"use client"

import dynamic from "next/dynamic"

/**
 * Email Template Builder - Edit Mode Page
 * Route: /admin/[resortName]/template-builder/edit/[...id]
 *
 * Dynamically imports the edit panel with SSR disabled to prevent
 * server-side rendering issues with email builder dependencies
 */
const EditTemplatePanelWithProviders = dynamic(
  () =>
    import("@/features/email-template-builder").then((mod) => {
      // Return a component that wraps EditTemplatePanel with providers
      const { EditTemplatePanel, EmailTemplateBuilderProviders } = mod
      return {
        default: () => (
          <EmailTemplateBuilderProviders>
            <EditTemplatePanel />
          </EmailTemplateBuilderProviders>
        ),
      }
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading template editor...</p>
        </div>
      </div>
    ),
  }
)

export default function TemplateBuilderEditPage() {
  return <EditTemplatePanelWithProviders />
}
