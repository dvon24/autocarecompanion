import { PhaseProvider } from '@/contexts/PhaseContext';
import { DesignSystemDemo } from '@/components/ui/DesignSystemDemo';

export default function HomePage() {
  return (
    <PhaseProvider>
      <DesignSystemDemo />
    </PhaseProvider>
  );
}
