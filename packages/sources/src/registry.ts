import type { SourceAdapter, SourceProviderId } from './types';

const adapters = new Map<SourceProviderId, SourceAdapter>();

export function registerAdapter(adapter: SourceAdapter) {
  adapters.set(adapter.id, adapter);
}

export function getAdapter(id: SourceProviderId): SourceAdapter | undefined {
  return adapters.get(id);
}

export function listAdapters(): SourceAdapter[] {
  return [...adapters.values()];
}

export function listPrimaryAdapters(): SourceAdapter[] {
  return listAdapters().filter((a) => a.kind === 'primary');
}
