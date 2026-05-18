import { useOutletContext } from 'react-router-dom';
import type { AppContext } from '../App';
import { LeadsPanel } from '../components/LeadsPanel';

export default function LeadsPage() {
  const ctx = useOutletContext<AppContext>();
  return (
    <LeadsPanel
      standalone
      onApplicationAdded={() => ctx.showToast('Added to applications')}
    />
  );
}
