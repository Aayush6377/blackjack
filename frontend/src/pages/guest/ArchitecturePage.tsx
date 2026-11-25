import { ArchitectureFlowDiagram } from "../../components/guest/architecture/ArchitectureFlowDiagram";
import { BackendModulesShowcase } from "../../components/guest/architecture/BackendModulesShowcase";
import { RequestLifecycleSteps } from "../../components/guest/architecture/RequestLifecycleSteps";
import { GuestPageHeader } from "../../components/layout/guest/GuestPageHeader";

export default function ArchitecturePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <GuestPageHeader
        eyebrow="Blackjack Royale · System Design"
        title="System Architecture & Modules"
        subtitle="High-level view of how the React + Vite frontend, Spring Boot 4.1.2 backend modules, Redis cache, and PostgreSQL database work together."
      />

      <div className="space-y-6">
        <ArchitectureFlowDiagram />
        <RequestLifecycleSteps />
        <BackendModulesShowcase />
      </div>
    </section>
  );
}