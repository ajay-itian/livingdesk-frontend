import ManagedOfficeDetail from '@/components/features/offices/ManagedOfficeDetail';
import { locations } from '@/components/features/offices/officeData';

export function generateStaticParams() {
    return locations.map((location) => ({
        slug: location.slug,
    }));
}

export default function Page() {
    return <ManagedOfficeDetail />;
}