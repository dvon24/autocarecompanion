export async function requestEmailPreference(fetcher: typeof fetch, value?: boolean): Promise<boolean> {
  const response = await fetcher('/api/notifications/preferences', value === undefined
    ? {cache:'no-store'}
    : {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({emailNotifications:value})});
  const payload = await response.json().catch(()=>({}));
  if (!response.ok || typeof payload.preferences?.emailNotifications !== 'boolean') {
    throw new Error(payload.error || 'Could not update notification preferences. Please try again.');
  }
  return payload.preferences.emailNotifications;
}
