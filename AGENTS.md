# AGENTS.md

## Project Overview
This is a Vue3 + Vite enterprise management system (港口生产管理系统) with Element Plus and custom YY Framework components. The project uses Pinia for state management and SCSS for styling.

## Build & Development Commands

```bash
# Install dependencies
yarn --registry=https://registry.npmmirror.com

# Development server (runs on port 9099)
yarn dev

# Build for staging environment
yarn build:stage

# Build for production
yarn build:prod

# Preview build
yarn preview

# Run documentation server
yarn docs:dev
```

**Note**: This project does not have a test suite configured. No test commands are available.

## Code Style Guidelines

### Import Conventions
- Use `@/` alias for `src/` directory imports: `import User from '@/api/system/user'`
- Use `~/` alias for root directory imports: `import path from 'path'`
- Group imports with clear comment sections (see `main.js:1-62` for examples)
- Import order: 
  1. framework dependencies
  2. UI Frameworks
  3. Third-party libraries
  4. Local imports (components, utils, store)
  5. Styles

### Formatting Configuration
- **Indentation**: Use tabs (see `.prettierrc:4`)
- **Quotes**: Single quotes (`'`) for strings (`.prettierrc:6`)
- **Semicolon**: No semicolons at end of statements (`.prettierrc:5`)
- **Line width**: 140 characters max (`.prettierrc:3`)
- **Tab width**: 4 spaces when tabs are converted (`.prettierrc:2`)
- **Object spacing**: Always include space in object literals `{}`
- **Array spacing**: No space in array brackets `[]`
- **Trailing comma**: Never add trailing commas
- **End of line**: Files must end with newline

### Naming Conventions
- **Files**: camelCase - `user.js`, `getUserDetail.vue`
- **Components**: PascalCase - `UserList.vue`, `UserProfile.vue` (registered as PascalCase: `app.component('UserList', UserList)`)
- **Functions**: camelCase - `getUserById()`, `handleSubmit()`
- **Variables**: camelCase - `userId`, `isActive`
- **Constants**: UPPER_SNAKE_CASE or camelCase - `VITE_APP_ENV`, `apiBaseUrl`
- **Vue props**: camelCase in script, kebab-case in template
- **Pinia stores**: camelCase with `use` prefix - `useUserStore`, `useAppStore`

### TypeScript & Types
- **Note**: This project uses JavaScript with comments for JSDoc documentation
- **JSDoc**: Use JSDoc comments for API functions documenting parameters and return types
- **Example**: See `src/api/system/user.js:5-13` for JSDoc pattern
- **State**: Define Pinia stores with clear type annotations in JSDoc comments

### Error Handling
- Use async/await with try-catch for error handling in components
- Use `.then()` and `.catch()` for Promise chains (common pattern in this codebase)
- Always export error from catch blocks: `[functionName](${err.message || err})`
- Example: `src/store/modules/user.js:39-41`
- Show user-friendly error messages using `ElMessage.error()`

### Vue.js Component Structure
```vue
<template>
  <!-- Template code -->
</template>

<script setup>
// 1. Imports
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

// 2. Props/Emits (if component)
const props = defineProps({
  // props definition
})

// 3. Store & composables
const userStore = useUserStore()

// 4. State management
const loading = ref(false)
const formData = ref({})

// 5. Computed properties
const disabled = computed(() => loading.value)

// 6. Methods
const handleSubmit = async () => {
  // implementation
}

// 7. Lifecycle hooks
onMounted(() => {
  // implementation
})
</script>

<style scoped lang="scss">
/* Component styles */
</style>
```

### API Layer Guidelines
- Organize API calls by domain in `src/api/` directory (e.g., `src/api/system/`, `src/api/master/`)
- Use the centralized `request` from `@/utils/auth/request`
- Export as default object with named functions
- Each function uses `request()` with method (`get`, `post`, `put`, `delete`)
- Path parameters: concatenate in URL string `'/api/internal/user/' + userId`
- Query parameters: use `params` object in request config
- Request body: use `data` object in request config

### Store Guidelines (Pinia)
- Store files in `src/store/modules/`
- Use `defineStore(id, options)` factory pattern
- Store IDs: lowercase with underscores - `'user'`, `'permission'`
- State: function returning object with initial values
- Actions: use Promises and async/await for async operations
- Getters: optional, for computed state derivations
- Export store, not default

### Global Properties
Available globally on `this` in components:
- `this.useDict()` - Dictionary helper
- `this.download()` - File download
- `this.parseTime()` - Date formatting
- `this.resetForm()` - Form reset
- `this.flattenToTree()` - Tree structure conversion
- `this.addDateRange()` - Add date range to params
- `this.selectDictLabel()` - Get dictionary label
- `this.$message` - Element Plus message (ElMessage)
- `this.$request` - HTTP request instance
- `this.$bus` - Event bus (mitt)

### Component Registration
Global components (registered in `main.js:101-108`):
- `DictTag` - Dictionary tag component
- `Pagination` - Pagination component
- `TreeSelect` - Tree select component
- `ImageUpload` - Image upload component
- `ImagePreview` - Image preview component
- `RightToolbar` - Right toolbar component
- `Editor` - Rich text editor
- `svg-icon` - SVG icon component

### Component Organization
- **Base components**: `src/components/` - Reusable UI components
- **Views**: `src/views/` - Page components organized by domain (system, master, home, etc.)
- **Layout**: `src/layout/` - App shell components (Sidebar, Navbar, etc.)
- **Plugins**: `src/plugins/` - Application plugins and utilities
- **Directives**: `src/directive/` - Custom Vue directives

### File Extensions
- Vue components: `.vue`
- JavaScript modules: `.js`
- Styles: `.scss` (main), `.css` (third-party)
- Assets: `.png`, `.jpg`, `.svg`, `.ttf` (fonts)

### Comments
- Use JSDoc style comments (`/** ... */`) for API functions documenting parameters and return values
- Use inline comments (`//`) for explanations
- Comment sections with divider lines for major code blocks
- No file headers or excessive comments - prefer self-documenting code
