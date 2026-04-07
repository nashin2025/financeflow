# Debugging Guide: Add Money Button Issue

## Changes Made

### 1. Enhanced Error Handling
**File**: `src/components/add-money-to-goal-modal.tsx`

- Added detailed error logging with HTTP status codes
- Error messages now show actual API response errors
- Added console.error() for debugging

### 2. Improved Type Safety
**File**: `src/app/goals/page.tsx`

- Changed `selectedGoal` from `any` type to proper Goal type
- Prevents potential runtime errors from missing properties

### 3. Added Null Guards
**File**: `src/components/add-money-to-goal-modal.tsx`

- Guards against null goal values
- Modal gracefully handles edge cases

## Troubleshooting Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Click "Add Money" button
4. Look for any error messages

**Expected behavior**: No errors, modal opens

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Add Money" button
4. Enter amount and submit

**Expected requests**:
- `PUT /api/goals?id=<goal-id>` → 200 OK
- Response should contain updated goal

### Step 3: Check Authentication
1. Open DevTools → Application → Cookies
2. Look for cookies named:
   - `__Host-ff-access`
   - `ff-access`

**Expected**: At least one should exist with a JWT token value

### Step 4: Verify Goal Object
In browser console, after clicking "Add Money":
```javascript
// This should work
localStorage.getItem('app-store')
// Should show goals with all required properties:
// {id, name, currentAmount, targetAmount, icon, color}
```

## Common Issues & Solutions

### Issue 1: Modal Doesn't Open
- **Cause**: `selectedGoal` might be null or `showDetailsModal` is true
- **Fix**: Check that only "Add Money" button is clicked, not "View Details"

### Issue 2: API Returns 401 (Unauthorized)
- **Cause**: JWT token expired or missing
- **Fix**: 
  1. Logout and login again
  2. Check if cookies are being set correctly
  3. Clear cookies and refresh

### Issue 3: API Returns 400 (Bad Request)
- **Cause**: Goal ID is missing or invalid
- **Fix**: Check that goal object has valid `id` property

### Issue 4: "Failed to add money" Error Shows
- **Cause**: API error or network issue
- **Fix**: 
  1. Check DevTools Console for error details
  2. Check Network tab for API response
  3. Try with smaller amount

## Expected Behavior Flow

```
Click "Add Money" Button
    ↓
Modal Opens (Modal component renders)
    ↓
Enter Amount in Input Field
    ↓
Preview Shows: "After adding $X, your progress will be..."
    ↓
Click "Add Money" Submit Button
    ↓
Loading State: Button shows "Adding..." with spinner
    ↓
API Call: PUT /api/goals?id=<id> with currentAmount
    ↓
Store Updates: updateGoal() called with new amount
    ↓
Modal Closes Automatically
    ↓
Progress Bar Updates on Goal Card
```

## API Request/Response Example

### Request
```json
PUT /api/goals?id=abc123
Content-Type: application/json

{
  "currentAmount": 5500
}
```

### Expected Response (200 OK)
```json
{
  "goal": {
    "id": "abc123",
    "name": "Vacation Fund",
    "currentAmount": 5500,
    "targetAmount": 10000,
    "targetDate": "2024-12-31",
    "icon": "✈️",
    "color": "#3B82F6",
    "monthlyContribution": 0,
    "type": "vacation",
    "updatedAt": "2024-04-07T10:30:00Z"
  },
  "message": "Goal updated"
}
```

## Testing Checklist

- [ ] Modal opens when "Add Money" button is clicked
- [ ] Input field accepts numeric values
- [ ] Preview text updates as you type
- [ ] "Add Money" submit button is enabled after entering amount
- [ ] Loading state shows while submitting
- [ ] No errors appear in Browser Console
- [ ] Network request shows 200 OK
- [ ] Modal closes after successful submission
- [ ] Goal progress updates on the card
- [ ] Amount validation: rejects 0 or negative
- [ ] Amount validation: rejects values > 1,000,000

## Logs to Check

After making changes and trying again:

```bash
# Check if browser console shows:
// Should see console.error only if there's an actual error
console.error('Add money error:', message)

# Check network response in DevTools
// The error message will now show actual API error details
// Example: "Failed to update goal (401)" for auth issues
```

---

If the issue persists after these changes, open DevTools and share:
1. The exact error message from the Console tab
2. The API response from the Network tab
3. Whether the cookies are present in Application → Cookies
