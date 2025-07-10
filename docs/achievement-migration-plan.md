# Achievement System Migration Plan

## Overview

This document outlines the migration path from localStorage-based achievement storage to user account-based achievement storage. The current implementation uses localStorage for immediate functionality, but is designed to be easily migrated to a server-based system.

## Current Implementation

### Data Storage
- **Location**: localStorage with key `achievement-data`
- **Structure**:
  ```typescript
  interface AchievementData {
    unlockedAchievements: UnlockedAchievement[]
    lastChecked: string
  }
  ```

### Achievement Checking
- Triggered on dashboard component mount
- Checks against study streak data in localStorage
- Immediately unlocks new achievements

## Migration Requirements

### 1. Backend Implementation

#### Database Schema
```sql
-- Users table (assuming exists)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  achievement_id VARCHAR NOT NULL,
  unlocked_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Achievement definitions table (optional - for server-side validation)
CREATE TABLE achievement_definitions (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  icon VARCHAR NOT NULL,
  rarity VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  condition_description VARCHAR NOT NULL
);
```

#### API Endpoints
```typescript
// Get user achievements
GET /api/achievements
Response: UnlockedAchievement[]

// Unlock achievement
POST /api/achievements
Body: { achievementId: string }
Response: UnlockedAchievement

// Bulk achievement check (for migration)
POST /api/achievements/check
Body: { studyData: StudyStreakData }
Response: { newAchievements: UnlockedAchievement[] }
```

### 2. Frontend Migration

#### Phase 1: Dual Storage
- Keep localStorage for immediate response
- Sync with server in background
- Handle offline scenarios

#### Phase 2: Server-First
- Primary storage on server
- localStorage as cache only
- Implement optimistic updates

#### Code Changes Required

##### useAchievements Hook Updates
```typescript
export function useAchievements() {
  // Add authentication context
  const { user, isAuthenticated } = useAuth()
  
  // Modify storage functions
  const loadAchievementData = useCallback(async (): Promise<AchievementData> => {
    if (isAuthenticated && user) {
      // Load from server
      try {
        const response = await fetch('/api/achievements')
        const serverData = await response.json()
        
        // Sync with localStorage for caching
        const localData = { 
          unlockedAchievements: serverData, 
          lastChecked: new Date().toISOString() 
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localData))
        
        return localData
      } catch (error) {
        console.error('Failed to load from server, using localStorage:', error)
        // Fallback to localStorage
        return loadFromLocalStorage()
      }
    } else {
      // Not authenticated, use localStorage only
      return loadFromLocalStorage()
    }
  }, [isAuthenticated, user])

  const unlockAchievement = useCallback(async (achievementId: string) => {
    // ... existing validation logic ...

    if (isAuthenticated && user) {
      // Server-first approach
      try {
        const response = await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ achievementId })
        })
        
        if (response.ok) {
          const newAchievement = await response.json()
          // Update local state
          setUnlockedAchievements(prev => [...prev, newAchievement])
          setNewAchievements(prev => [...prev, newAchievement])
          
          // Update localStorage cache
          const localData = loadFromLocalStorage()
          localData.unlockedAchievements.push(newAchievement)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localData))
          
          // Dispatch event for notifications
          window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: newAchievement }))
        }
      } catch (error) {
        console.error('Failed to unlock on server, storing locally:', error)
        // Fallback to localStorage and queue for sync
        unlockLocallyAndQueue(achievementId)
      }
    } else {
      // Not authenticated, use localStorage only
      unlockLocally(achievementId)
    }
  }, [isAuthenticated, user])
}
```

### 3. Migration Strategy

#### Step 1: Data Migration
When user signs in for the first time:
1. Check for existing localStorage achievements
2. Upload to server if any exist
3. Merge with any existing server data
4. Clear localStorage migration flag

#### Step 2: Sync Mechanism
```typescript
const syncAchievements = async () => {
  const localData = loadFromLocalStorage()
  const queuedAchievements = getQueuedAchievements()
  
  if (queuedAchievements.length > 0) {
    try {
      await Promise.all(
        queuedAchievements.map(id => 
          fetch('/api/achievements', {
            method: 'POST',
            body: JSON.stringify({ achievementId: id })
          })
        )
      )
      clearQueuedAchievements()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }
}
```

### 4. Implementation Timeline

#### Week 1: Backend Setup
- [ ] Create database tables
- [ ] Implement API endpoints
- [ ] Add authentication middleware
- [ ] Create migration scripts

#### Week 2: Frontend Integration
- [ ] Update useAchievements hook for dual storage
- [ ] Implement sync mechanisms
- [ ] Add offline handling
- [ ] Create migration utilities

#### Week 3: Testing & Rollout
- [ ] Test migration scenarios
- [ ] Implement rollback mechanisms
- [ ] Deploy with feature flags
- [ ] Monitor sync performance

### 5. Considerations

#### Security
- Validate achievement unlock conditions server-side
- Prevent client-side manipulation
- Rate limit achievement checking endpoints

#### Performance
- Cache achievements locally for quick access
- Batch achievement checks when possible
- Use WebSocket for real-time updates (optional)

#### Offline Support
- Queue achievement unlocks when offline
- Sync when connection restored
- Handle conflicts gracefully

#### Data Integrity
- Validate achievement logic server-side
- Prevent duplicate achievements
- Handle timezone differences consistently

## Testing Strategy

### Unit Tests
- Achievement checking logic
- Migration utilities
- Sync mechanisms

### Integration Tests
- End-to-end achievement flow
- Migration scenarios
- Offline/online transitions

### Performance Tests
- Large achievement datasets
- Concurrent user scenarios
- Sync performance under load

## Rollback Plan

If issues arise during migration:
1. Disable server-side achievement storage
2. Revert to localStorage-only mode
3. Preserve user data in both locations
4. Fix issues and re-enable gradually

## Success Metrics

- [ ] 100% achievement data preserved during migration
- [ ] <500ms average response time for achievement operations
- [ ] <1% sync failure rate
- [ ] Zero data loss incidents
- [ ] User satisfaction maintained or improved 