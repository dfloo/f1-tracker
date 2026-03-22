import { getConstructorsDirectory } from '@/lib/server/domainService';
import { okJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  return okJson({ constructors: getConstructorsDirectory() });
}
