// Google Drive Synchronization Service for FlipGen
// Handles OAuth 2.0, Google Drive REST API, automatic cloud syncing on page open,
// and cross-device sync of localhost settings, dark/light theme, and sales archive.

const AUTH_STORAGE_KEY = 'flipgen_gdrive_auth';
const LAST_SYNC_KEY = 'flipgen_gdrive_last_sync';
const FILE_ID_KEY = 'flipgen_gdrive_file_id';
const CLOUD_MOCK_STORAGE = 'flipgen_cloud_mock_storage';

const DRIVE_FILE_NAME = 'flipgen_reseller_data.json';
const DRIVE_FILE_MIME = 'application/json';

// Listeners for sync status updates
const syncListeners = new Set();

function notifyListeners(state) {
  syncListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (err) {
      console.error('Error notifying sync listener:', err);
    }
  });
}

export function subscribeToDriveSync(listener) {
  syncListeners.add(listener);
  listener(getDriveSyncState());
  return () => syncListeners.delete(listener);
}

/**
 * Returns current Google Drive connection and sync state
 */
export function getDriveSyncState() {
  let auth = null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) auth = JSON.parse(raw);
  } catch (e) {
    auth = null;
  }

  const lastSync = localStorage.getItem(LAST_SYNC_KEY) || null;
  const fileId = localStorage.getItem(FILE_ID_KEY) || null;

  return {
    isConnected: !!(auth && auth.user),
    user: auth?.user || null,
    isDemo: !!auth?.isDemo,
    lastSyncedAt: lastSync,
    fileId: fileId,
    clientId: auth?.clientId || '',
    isSyncing: false
  };
}

/**
 * Connect with 1-Click Demo Google Account
 * Provides immediate zero-friction Google Drive cloud sync for testing & evaluation.
 */
export async function connectDemoGoogleAccount() {
  const demoUser = {
    name: 'Alex Reseller',
    email: 'alex.reseller@gmail.com',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    given_name: 'Alex'
  };

  const authData = {
    user: demoUser,
    isDemo: true,
    token: 'demo-token-' + Date.now(),
    clientId: 'demo-client-id'
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  localStorage.setItem(FILE_ID_KEY, 'gdrive-file-demo-98w42');

  notifyListeners({
    ...getDriveSyncState(),
    isSyncing: true
  });

  // Simulate network roundtrip to Google Drive
  await new Promise((r) => setTimeout(r, 600));

  const now = new Date().toISOString();
  localStorage.setItem(LAST_SYNC_KEY, now);

  notifyListeners({
    ...getDriveSyncState(),
    isSyncing: false,
    lastSyncedAt: now
  });

  return demoUser;
}

/**
 * Connect with Real Google OAuth 2.0 (Google Identity Services)
 */
export function connectRealGoogleAccount(clientId) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      reject(new Error('Google Identity Services script not yet loaded. Please try again.'));
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          try {
            // Fetch user profile from Google UserInfo endpoint
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const userData = await userRes.json();

            const authData = {
              user: {
                name: userData.name || userData.email,
                email: userData.email,
                picture: userData.picture || '',
                given_name: userData.given_name || ''
              },
              isDemo: false,
              token: tokenResponse.access_token,
              expiresAt: Date.now() + (tokenResponse.expires_in || 3599) * 1000,
              clientId: clientId
            };

            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
            resolve(authData.user);
          } catch (fetchErr) {
            reject(fetchErr);
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Disconnect Google Drive
 */
export function disconnectGoogleAccount() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(FILE_ID_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);

  notifyListeners({
    isConnected: false,
    user: null,
    isDemo: false,
    lastSyncedAt: null,
    fileId: null,
    clientId: '',
    isSyncing: false
  });
}

/**
 * Pull latest data from Google Drive
 * Automatically called on page load if logged in, or when manually triggered.
 */
export async function syncFromGoogleDrive() {
  const state = getDriveSyncState();
  if (!state.isConnected) return null;

  notifyListeners({ ...state, isSyncing: true });

  try {
    let cloudData = null;

    if (state.isDemo) {
      // Demo mock cloud pull
      await new Promise((r) => setTimeout(r, 450));
      const raw = localStorage.getItem(CLOUD_MOCK_STORAGE);
      if (raw) {
        cloudData = JSON.parse(raw);
      }
    } else {
      // Real Google Drive API query
      const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
      const token = auth.token;

      // 1. Search for existing flipgen_reseller_data.json
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${DRIVE_FILE_NAME}' and trashed=false&fields=files(id,name,modifiedTime)`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const existingFile = searchData.files && searchData.files[0];

        if (existingFile) {
          localStorage.setItem(FILE_ID_KEY, existingFile.id);

          // 2. Fetch content
          const fileRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (fileRes.ok) {
            cloudData = await fileRes.json();
          }
        }
      }
    }

    const now = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, now);

    notifyListeners({
      ...getDriveSyncState(),
      isSyncing: false,
      lastSyncedAt: now
    });

    return cloudData;
  } catch (err) {
    console.error('Failed to sync from Google Drive:', err);
    notifyListeners({ ...state, isSyncing: false });
    return null;
  }
}

/**
 * Push current local data (preferences, host URL, theme, sales archive) to Google Drive
 */
export async function syncToGoogleDrive(payload) {
  const state = getDriveSyncState();
  if (!state.isConnected) return false;

  notifyListeners({ ...state, isSyncing: true });

  try {
    const fullBundle = {
      ...payload,
      appName: 'FlipGen Reseller Engine',
      version: '1.0.0',
      syncedAt: new Date().toISOString()
    };

    if (state.isDemo) {
      // Mock cloud store
      await new Promise((r) => setTimeout(r, 500));
      localStorage.setItem(CLOUD_MOCK_STORAGE, JSON.stringify(fullBundle));
    } else {
      // Real Google Drive API upload
      const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
      const token = auth.token;
      const fileId = localStorage.getItem(FILE_ID_KEY);

      const metadata = {
        name: DRIVE_FILE_NAME,
        mimeType: DRIVE_FILE_MIME,
        description: 'FlipGen Local Reseller Engine user preferences, inventory ledger, and model settings.'
      };

      const fileContent = JSON.stringify(fullBundle, null, 2);

      // Multipart upload
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        closeDelim;

      let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';

      if (fileId) {
        uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
        method = 'PATCH';
      }

      const uploadRes = await fetch(uploadUrl, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      });

      if (uploadRes.ok) {
        const fileData = await uploadRes.json();
        if (fileData.id) {
          localStorage.setItem(FILE_ID_KEY, fileData.id);
        }
      } else {
        throw new Error(`Google Drive upload failed: ${uploadRes.status}`);
      }
    }

    const now = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, now);

    notifyListeners({
      ...getDriveSyncState(),
      isSyncing: false,
      lastSyncedAt: now
    });

    return true;
  } catch (err) {
    console.error('Failed to sync to Google Drive:', err);
    notifyListeners({ ...state, isSyncing: false });
    return false;
  }
}
