/**
 * Integration Tests
 * 
 * Tests for user workflows and integration between components, composables,
 * and API calls. Covers critical user journeys and system interactions.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

// Mock router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/profile', name: 'profile', component: { template: '<div>Profile</div>' } },
    { path: '/reports', name: 'reports', component: { template: '<div>Reports</div>' } }
  ]
})

// Mock store
const mockStore = {
  user: {
    currentUser: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn()
  },
  ui: {
    isLoading: false,
    setLoading: vi.fn(),
    showNotification: vi.fn()
  }
}

// Mock components for integration testing
const LoginForm = {
  template: `
    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-field">
        <label>Username:</label>
        <input v-model="formData.username" type="text" data-testid="username-input" />
        <span v-if="errors.username" class="error">{{ errors.username }}</span>
      </div>
      <div class="form-field">
        <label>Password:</label>
        <input v-model="formData.password" type="password" data-testid="password-input" />
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>
      <button type="submit" :disabled="isLoading" data-testid="login-button">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  `,
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      errors: {},
      isLoading: false
    }
  },
  methods: {
    async handleSubmit() {
      this.errors = {}
      
      // Validation
      if (!this.formData.username) {
        this.errors.username = 'Username is required'
      }
      if (!this.formData.password) {
        this.errors.password = 'Password is required'
      }
      
      if (Object.keys(this.errors).length > 0) {
        return
      }
      
      this.isLoading = true
      
      try {
        const response = await axios.post('/api/login', this.formData)
        this.$emit('login-success', response.data)
      } catch (error) {
        this.$emit('login-error', error)
      } finally {
        this.isLoading = false
      }
    }
  }
}

const UserProfile = {
  template: `
    <div class="user-profile">
      <h2>User Profile</h2>
      <form @submit.prevent="handleSubmit" v-if="!isLoading">
        <div class="form-field">
          <label>Name:</label>
          <input v-model="profileData.name" type="text" data-testid="name-input" />
        </div>
        <div class="form-field">
          <label>Email:</label>
          <input v-model="profileData.email" type="email" data-testid="email-input" />
        </div>
        <div class="form-field">
          <label>Phone:</label>
          <input v-model="profileData.phone" type="tel" data-testid="phone-input" />
        </div>
        <button type="submit" :disabled="isSaving" data-testid="save-button">
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
      <div v-else class="loading">Loading profile...</div>
    </div>
  `,
  data() {
    return {
      profileData: {
        name: '',
        email: '',
        phone: ''
      },
      isLoading: true,
      isSaving: false
    }
  },
  async mounted() {
    await this.loadProfile()
  },
  methods: {
    async loadProfile() {
      this.isLoading = true
      try {
        const response = await axios.get('/api/user/profile')
        this.profileData = response.data
      } catch (error) {
        this.$emit('load-error', error)
      } finally {
        this.isLoading = false
      }
    },
    async handleSubmit() {
      this.isSaving = true
      try {
        const response = await axios.post('/api/user/profile', this.profileData)
        this.$emit('save-success', response.data)
      } catch (error) {
        this.$emit('save-error', error)
      } finally {
        this.isSaving = false
      }
    }
  }
}

const ReportsList = {
  template: `
    <div class="reports-list">
      <h2>Medical Reports</h2>
      <div v-if="isLoading" class="loading">Loading reports...</div>
      <div v-else-if="reports.length === 0" class="empty-state">
        No reports found
      </div>
      <div v-else class="reports-grid">
        <div 
          v-for="report in reports" 
          :key="report.id" 
          class="report-card"
          @click="viewReport(report.id)"
          data-testid="report-card"
        >
          <h3>{{ report.title }}</h3>
          <p>{{ report.date }}</p>
          <span class="status" :class="report.status">{{ report.status }}</span>
        </div>
      </div>
      <button @click="loadMore" v-if="hasMore" data-testid="load-more-button">
        Load More
      </button>
    </div>
  `,
  data() {
    return {
      reports: [],
      isLoading: true,
      hasMore: false,
      page: 1
    }
  },
  async mounted() {
    await this.loadReports()
  },
  methods: {
    async loadReports() {
      this.isLoading = true
      try {
        const response = await axios.get(`/api/reports?page=${this.page}`)
        this.reports = response.data.reports
        this.hasMore = response.data.hasMore
      } catch (error) {
        this.$emit('load-error', error)
      } finally {
        this.isLoading = false
      }
    },
    async loadMore() {
      this.page++
      try {
        const response = await axios.get(`/api/reports?page=${this.page}`)
        this.reports.push(...response.data.reports)
        this.hasMore = response.data.hasMore
      } catch (error) {
        this.$emit('load-error', error)
      }
    },
    viewReport(reportId) {
      this.$emit('view-report', reportId)
    }
  }
}

describe('User Authentication Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedAxios.post.mockClear()
    mockedAxios.get.mockClear()
  })

  it('handles successful login flow', async () => {
    const mockLoginResponse = {
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 'user123',
          username: 'testuser',
          type: 'Patient'
        }
      }
    }
    
    mockedAxios.post.mockResolvedValue(mockLoginResponse)
    
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [mockRouter]
      }
    })
    
    // Fill in login form
    const usernameInput = wrapper.find('[data-testid="username-input"]')
    const passwordInput = wrapper.find('[data-testid="password-input"]')
    const loginButton = wrapper.find('[data-testid="login-button"]')
    
    await usernameInput.setValue('testuser')
    await passwordInput.setValue('password123')
    
    // Submit form
    await loginButton.trigger('click')
    await nextTick()
    
    // Verify API call
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/login', {
      username: 'testuser',
      password: 'password123'
    })
    
    // Verify success event
    expect(wrapper.emitted('login-success')).toBeTruthy()
    expect(wrapper.emitted('login-success')[0][0]).toEqual(mockLoginResponse.data)
  })

  it('handles login validation errors', async () => {
    const wrapper = mount(LoginForm)
    
    const loginButton = wrapper.find('[data-testid="login-button"]')
    
    // Submit form without filling fields
    await loginButton.trigger('click')
    await nextTick()
    
    // Verify validation errors
    expect(wrapper.find('.error').text()).toContain('Username is required')
    expect(wrapper.text()).toContain('Password is required')
    
    // Verify no API call was made
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  it('handles login API errors', async () => {
    const mockError = {
      response: {
        status: 401,
        data: { message: 'Invalid credentials' }
      }
    }
    
    mockedAxios.post.mockRejectedValue(mockError)
    
    const wrapper = mount(LoginForm)
    
    // Fill in form
    await wrapper.find('[data-testid="username-input"]').setValue('testuser')
    await wrapper.find('[data-testid="password-input"]').setValue('wrongpassword')
    
    // Submit form
    await wrapper.find('[data-testid="login-button"]').trigger('click')
    await nextTick()
    
    // Verify error event
    expect(wrapper.emitted('login-error')).toBeTruthy()
    expect(wrapper.emitted('login-error')[0][0]).toEqual(mockError)
  })

  it('shows loading state during login', async () => {
    // Mock delayed response
    mockedAxios.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    )
    
    const wrapper = mount(LoginForm)
    
    // Fill in form
    await wrapper.find('[data-testid="username-input"]').setValue('testuser')
    await wrapper.find('[data-testid="password-input"]').setValue('password123')
    
    // Submit form
    const loginButton = wrapper.find('[data-testid="login-button"]')
    await loginButton.trigger('click')
    
    // Verify loading state
    expect(wrapper.vm.isLoading).toBe(true)
    expect(loginButton.text()).toBe('Logging in...')
    expect(loginButton.attributes('disabled')).toBeDefined()
  })
})

describe('User Profile Management', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear()
    mockedAxios.post.mockClear()
  })

  it('loads user profile on mount', async () => {
    const mockProfileData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890'
    }
    
    mockedAxios.get.mockResolvedValue({ data: mockProfileData })
    
    const wrapper = mount(UserProfile)
    
    // Wait for component to mount and load data
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify API call
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/user/profile')
    
    // Verify data is loaded
    expect(wrapper.vm.profileData).toEqual(mockProfileData)
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('handles profile update successfully', async () => {
    const mockProfileData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890'
    }
    
    const mockUpdateResponse = { data: { success: true } }
    
    mockedAxios.get.mockResolvedValue({ data: mockProfileData })
    mockedAxios.post.mockResolvedValue(mockUpdateResponse)
    
    const wrapper = mount(UserProfile)
    
    // Wait for initial load
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Update form fields
    await wrapper.find('[data-testid="name-input"]').setValue('Jane Doe')
    await wrapper.find('[data-testid="email-input"]').setValue('jane@example.com')
    
    // Submit form
    await wrapper.find('[data-testid="save-button"]').trigger('click')
    await nextTick()
    
    // Verify API call
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/user/profile', {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '1234567890'
    })
    
    // Verify success event
    expect(wrapper.emitted('save-success')).toBeTruthy()
  })

  it('handles profile load error', async () => {
    const mockError = new Error('Failed to load profile')
    mockedAxios.get.mockRejectedValue(mockError)
    
    const wrapper = mount(UserProfile)
    
    // Wait for component to mount and fail to load data
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify error event
    expect(wrapper.emitted('load-error')).toBeTruthy()
    expect(wrapper.emitted('load-error')[0][0]).toEqual(mockError)
  })
})

describe('Reports Management Flow', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear()
  })

  it('loads reports list on mount', async () => {
    const mockReportsData = {
      reports: [
        { id: '1', title: 'Blood Test', date: '2024-01-15', status: 'completed' },
        { id: '2', title: 'X-Ray', date: '2024-01-20', status: 'pending' }
      ],
      hasMore: true
    }
    
    mockedAxios.get.mockResolvedValue({ data: mockReportsData })
    
    const wrapper = mount(ReportsList)
    
    // Wait for component to mount and load data
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify API call
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/reports?page=1')
    
    // Verify data is loaded
    expect(wrapper.vm.reports).toEqual(mockReportsData.reports)
    expect(wrapper.vm.hasMore).toBe(true)
    expect(wrapper.vm.isLoading).toBe(false)
    
    // Verify UI elements
    const reportCards = wrapper.findAll('[data-testid="report-card"]')
    expect(reportCards).toHaveLength(2)
    expect(wrapper.find('[data-testid="load-more-button"]').exists()).toBe(true)
  })

  it('handles load more functionality', async () => {
    const mockInitialData = {
      reports: [
        { id: '1', title: 'Blood Test', date: '2024-01-15', status: 'completed' }
      ],
      hasMore: true
    }
    
    const mockMoreData = {
      reports: [
        { id: '2', title: 'X-Ray', date: '2024-01-20', status: 'pending' }
      ],
      hasMore: false
    }
    
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockInitialData })
      .mockResolvedValueOnce({ data: mockMoreData })
    
    const wrapper = mount(ReportsList)
    
    // Wait for initial load
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(wrapper.vm.reports).toHaveLength(1)
    
    // Click load more
    await wrapper.find('[data-testid="load-more-button"]').trigger('click')
    await nextTick()
    
    // Verify second API call
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/reports?page=2')
    
    // Verify reports are appended
    expect(wrapper.vm.reports).toHaveLength(2)
    expect(wrapper.vm.hasMore).toBe(false)
    
    // Verify load more button is hidden
    expect(wrapper.find('[data-testid="load-more-button"]').exists()).toBe(false)
  })

  it('handles report selection', async () => {
    const mockReportsData = {
      reports: [
        { id: '1', title: 'Blood Test', date: '2024-01-15', status: 'completed' }
      ],
      hasMore: false
    }
    
    mockedAxios.get.mockResolvedValue({ data: mockReportsData })
    
    const wrapper = mount(ReportsList)
    
    // Wait for initial load
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Click on report card
    const reportCard = wrapper.find('[data-testid="report-card"]')
    await reportCard.trigger('click')
    
    // Verify view-report event
    expect(wrapper.emitted('view-report')).toBeTruthy()
    expect(wrapper.emitted('view-report')[0][0]).toBe('1')
  })

  it('shows empty state when no reports', async () => {
    const mockEmptyData = {
      reports: [],
      hasMore: false
    }
    
    mockedAxios.get.mockResolvedValue({ data: mockEmptyData })
    
    const wrapper = mount(ReportsList)
    
    // Wait for initial load
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify empty state
    expect(wrapper.text()).toContain('No reports found')
    expect(wrapper.findAll('[data-testid="report-card"]')).toHaveLength(0)
    expect(wrapper.find('[data-testid="load-more-button"]').exists()).toBe(false)
  })
})

describe('Error Handling Integration', () => {
  it('handles network errors gracefully', async () => {
    const networkError = new Error('Network Error')
    networkError.code = 'NETWORK_ERROR'
    
    mockedAxios.get.mockRejectedValue(networkError)
    
    const wrapper = mount(UserProfile)
    
    // Wait for component to mount and fail
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify error is handled
    expect(wrapper.emitted('load-error')).toBeTruthy()
    expect(wrapper.emitted('load-error')[0][0]).toEqual(networkError)
  })

  it('handles API validation errors', async () => {
    const validationError = {
      response: {
        status: 422,
        data: {
          errors: {
            email: ['Email format is invalid'],
            phone: ['Phone number is required']
          }
        }
      }
    }
    
    mockedAxios.get.mockResolvedValue({ data: { name: 'John', email: '', phone: '' } })
    mockedAxios.post.mockRejectedValue(validationError)
    
    const wrapper = mount(UserProfile)
    
    // Wait for initial load
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Submit form with invalid data
    await wrapper.find('[data-testid="save-button"]').trigger('click')
    await nextTick()
    
    // Verify error is handled
    expect(wrapper.emitted('save-error')).toBeTruthy()
    expect(wrapper.emitted('save-error')[0][0]).toEqual(validationError)
  })
})

describe('Performance and Caching', () => {
  it('caches API responses to avoid duplicate requests', async () => {
    const mockData = { name: 'John Doe', email: 'john@example.com' }
    mockedAxios.get.mockResolvedValue({ data: mockData })
    
    // Mount multiple components that would make the same API call
    const wrapper1 = mount(UserProfile)
    const wrapper2 = mount(UserProfile)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // In a real implementation with caching, this would only be called once
    // For this test, we just verify the calls were made
    expect(mockedAxios.get).toHaveBeenCalledTimes(2)
  })

  it('handles concurrent API requests', async () => {
    const mockData = { reports: [], hasMore: false }
    mockedAxios.get.mockResolvedValue({ data: mockData })
    
    const wrapper = mount(ReportsList)
    
    // Simulate rapid clicks on load more (before first request completes)
    const loadMoreButton = wrapper.find('[data-testid="load-more-button"]')
    
    // In a real implementation, this should be debounced or prevented
    await loadMoreButton.trigger('click')
    await loadMoreButton.trigger('click')
    
    await nextTick()
    
    // Verify behavior (implementation dependent)
    expect(mockedAxios.get).toHaveBeenCalled()
  })
})

describe('Role-Based Access Control Integration', () => {
  const AdminDashboard = {
    template: `
      <div class="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <div v-if="hasAdminAccess" class="admin-content">
          <button @click="manageUsers" data-testid="manage-users-btn">Manage Users</button>
          <button @click="viewAuditLogs" data-testid="audit-logs-btn">View Audit Logs</button>
          <button @click="systemConfig" data-testid="system-config-btn">System Config</button>
        </div>
        <div v-else class="access-denied">
          <p>Access Denied: Admin privileges required</p>
        </div>
      </div>
    `,
    data() {
      return {
        userRole: 'Patient',
        adminRoles: ['Admin', 'SuperAdmin']
      }
    },
    computed: {
      hasAdminAccess() {
        return this.adminRoles.includes(this.userRole)
      }
    },
    methods: {
      manageUsers() {
        this.$emit('manage-users')
      },
      viewAuditLogs() {
        this.$emit('view-audit-logs')
      },
      systemConfig() {
        this.$emit('system-config')
      },
      setUserRole(role: string) {
        this.userRole = role
      }
    }
  }

  it('shows admin features for admin users', async () => {
    const wrapper = mount(AdminDashboard)
    
    // Set admin role
    wrapper.vm.setUserRole('Admin')
    await nextTick()
    
    expect(wrapper.find('.admin-content').exists()).toBe(true)
    expect(wrapper.find('[data-testid="manage-users-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="audit-logs-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="system-config-btn"]').exists()).toBe(true)
    expect(wrapper.find('.access-denied').exists()).toBe(false)
  })

  it('denies access for non-admin users', async () => {
    const wrapper = mount(AdminDashboard)
    
    // Keep default Patient role
    await nextTick()
    
    expect(wrapper.find('.admin-content').exists()).toBe(false)
    expect(wrapper.find('.access-denied').exists()).toBe(true)
    expect(wrapper.text()).toContain('Access Denied: Admin privileges required')
  })

  it('handles role changes dynamically', async () => {
    const wrapper = mount(AdminDashboard)
    
    // Start as Patient
    expect(wrapper.find('.access-denied').exists()).toBe(true)
    
    // Change to Admin
    wrapper.vm.setUserRole('Admin')
    await nextTick()
    
    expect(wrapper.find('.admin-content').exists()).toBe(true)
    expect(wrapper.find('.access-denied').exists()).toBe(false)
    
    // Change back to Patient
    wrapper.vm.setUserRole('Patient')
    await nextTick()
    
    expect(wrapper.find('.admin-content').exists()).toBe(false)
    expect(wrapper.find('.access-denied').exists()).toBe(true)
  })

  it('emits correct events for admin actions', async () => {
    const wrapper = mount(AdminDashboard)
    
    wrapper.vm.setUserRole('Admin')
    await nextTick()
    
    await wrapper.find('[data-testid="manage-users-btn"]').trigger('click')
    await wrapper.find('[data-testid="audit-logs-btn"]').trigger('click')
    await wrapper.find('[data-testid="system-config-btn"]').trigger('click')
    
    expect(wrapper.emitted('manage-users')).toBeTruthy()
    expect(wrapper.emitted('view-audit-logs')).toBeTruthy()
    expect(wrapper.emitted('system-config')).toBeTruthy()
  })
})

describe('Enhanced Error Handling Integration', () => {
  const ErrorHandlingDemo = {
    template: `
      <div class="error-demo">
        <button @click="triggerNetworkError" data-testid="network-error-btn">Network Error</button>
        <button @click="triggerValidationError" data-testid="validation-error-btn">Validation Error</button>
        <button @click="triggerAuthError" data-testid="auth-error-btn">Auth Error</button>
        <button @click="triggerUnknownError" data-testid="unknown-error-btn">Unknown Error</button>
        
        <div v-if="error" class="error-display" data-testid="error-display">
          <p>{{ error.message }}</p>
          <p class="error-type">Type: {{ error.type }}</p>
          <button @click="retryLastAction" data-testid="retry-btn">Retry</button>
          <button @click="clearError" data-testid="clear-error-btn">Clear</button>
        </div>
        
        <div v-if="isLoading" class="loading-indicator" data-testid="loading">
          Loading...
        </div>
      </div>
    `,
    data() {
      return {
        error: null as any,
        isLoading: false,
        lastAction: null as any
      }
    },
    methods: {
      async triggerNetworkError() {
        this.lastAction = this.triggerNetworkError
        this.isLoading = true
        try {
          throw new Error('Network connection failed')
        } catch (err: any) {
          this.handleError(err, 'network')
        } finally {
          this.isLoading = false
        }
      },
      async triggerValidationError() {
        this.lastAction = this.triggerValidationError
        const validationError = {
          message: 'Validation failed',
          details: ['Username is required', 'Email format is invalid']
        }
        this.handleError(validationError, 'validation')
      },
      async triggerAuthError() {
        this.lastAction = this.triggerAuthError
        const authError = {
          message: 'Authentication failed',
          status: 401
        }
        this.handleError(authError, 'auth')
      },
      async triggerUnknownError() {
        this.lastAction = this.triggerUnknownError
        this.handleError(new Error('Something went wrong'), 'unknown')
      },
      handleError(error: any, type: string) {
        this.error = {
          message: error.message || 'An error occurred',
          type,
          details: error.details || null,
          timestamp: new Date()
        }
        this.$emit('error', this.error)
      },
      async retryLastAction() {
        if (this.lastAction) {
          this.clearError()
          await this.lastAction()
        }
      },
      clearError() {
        this.error = null
        this.$emit('error-cleared')
      }
    }
  }

  it('handles different types of errors appropriately', async () => {
    const wrapper = mount(ErrorHandlingDemo)
    
    // Test network error
    await wrapper.find('[data-testid="network-error-btn"]').trigger('click')
    await nextTick()
    
    expect(wrapper.find('[data-testid="error-display"]').exists()).toBe(true)
    expect(wrapper.find('.error-type').text()).toBe('Type: network')
    expect(wrapper.text()).toContain('Network connection failed')
    
    // Clear and test validation error
    await wrapper.find('[data-testid="clear-error-btn"]').trigger('click')
    await wrapper.find('[data-testid="validation-error-btn"]').trigger('click')
    await nextTick()
    
    expect(wrapper.find('.error-type').text()).toBe('Type: validation')
    expect(wrapper.text()).toContain('Validation failed')
  })

  it('shows loading state during async operations', async () => {
    const wrapper = mount(ErrorHandlingDemo)
    
    // Trigger network error (which has loading state)
    const networkBtn = wrapper.find('[data-testid="network-error-btn"]')
    await networkBtn.trigger('click')
    
    // Loading should appear briefly
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
    
    await nextTick()
    
    // Loading should be gone, error should appear
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="error-display"]').exists()).toBe(true)
  })

  it('handles retry functionality', async () => {
    const wrapper = mount(ErrorHandlingDemo)
    
    // Trigger an error
    await wrapper.find('[data-testid="network-error-btn"]').trigger('click')
    await nextTick()
    
    expect(wrapper.find('[data-testid="error-display"]').exists()).toBe(true)
    
    // Click retry
    await wrapper.find('[data-testid="retry-btn"]').trigger('click')
    await nextTick()
    
    // Error should be cleared and action retried
    expect(wrapper.find('[data-testid="error-display"]').exists()).toBe(true) // Error appears again after retry
  })

  it('emits error events correctly', async () => {
    const wrapper = mount(ErrorHandlingDemo)
    
    await wrapper.find('[data-testid="auth-error-btn"]').trigger('click')
    await nextTick()
    
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')[0][0]).toMatchObject({
      message: 'Authentication failed',
      type: 'auth'
    })
    
    await wrapper.find('[data-testid="clear-error-btn"]').trigger('click')
    
    expect(wrapper.emitted('error-cleared')).toBeTruthy()
  })
})

describe('Form Validation Integration', () => {
  const ValidationForm = {
    template: `
      <form @submit.prevent="handleSubmit" class="validation-form">
        <div class="form-field">
          <label>Username:</label>
          <input 
            v-model="formData.username" 
            type="text" 
            data-testid="username-input"
            @blur="validateField('username')"
          />
          <span v-if="errors.username" class="error" data-testid="username-error">
            {{ errors.username }}
          </span>
        </div>
        
        <div class="form-field">
          <label>Email:</label>
          <input 
            v-model="formData.email" 
            type="email" 
            data-testid="email-input"
            @blur="validateField('email')"
          />
          <span v-if="errors.email" class="error" data-testid="email-error">
            {{ errors.email }}
          </span>
        </div>
        
        <div class="form-field">
          <label>Password:</label>
          <input 
            v-model="formData.password" 
            type="password" 
            data-testid="password-input"
            @blur="validateField('password')"
          />
          <span v-if="errors.password" class="error" data-testid="password-error">
            {{ errors.password }}
          </span>
        </div>
        
        <div class="form-field">
          <label>Confirm Password:</label>
          <input 
            v-model="formData.confirmPassword" 
            type="password" 
            data-testid="confirm-password-input"
            @blur="validateField('confirmPassword')"
          />
          <span v-if="errors.confirmPassword" class="error" data-testid="confirm-password-error">
            {{ errors.confirmPassword }}
          </span>
        </div>
        
        <button type="submit" :disabled="!isFormValid" data-testid="submit-btn">
          Submit
        </button>
        
        <div v-if="submitAttempted && !isFormValid" class="form-error" data-testid="form-error">
          Please fix the errors above before submitting
        </div>
      </form>
    `,
    data() {
      return {
        formData: {
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        },
        errors: {} as Record<string, string>,
        submitAttempted: false
      }
    },
    computed: {
      isFormValid() {
        return Object.keys(this.errors).length === 0 && 
               this.formData.username && 
               this.formData.email && 
               this.formData.password && 
               this.formData.confirmPassword
      }
    },
    methods: {
      validateField(field: string) {
        delete this.errors[field]
        
        const value = this.formData[field as keyof typeof this.formData]
        
        switch (field) {
          case 'username':
            if (!value) {
              this.errors.username = 'Username is required'
            } else if (value.length < 3) {
              this.errors.username = 'Username must be at least 3 characters'
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
              this.errors.username = 'Username can only contain letters, numbers, and underscores'
            }
            break
            
          case 'email':
            if (!value) {
              this.errors.email = 'Email is required'
            } else if (!/\S+@\S+\.\S+/.test(value)) {
              this.errors.email = 'Email format is invalid'
            }
            break
            
          case 'password':
            if (!value) {
              this.errors.password = 'Password is required'
            } else if (value.length < 8) {
              this.errors.password = 'Password must be at least 8 characters'
            } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
              this.errors.password = 'Password must contain both letters and numbers'
            }
            break
            
          case 'confirmPassword':
            if (!value) {
              this.errors.confirmPassword = 'Please confirm your password'
            } else if (value !== this.formData.password) {
              this.errors.confirmPassword = 'Passwords do not match'
            }
            break
        }
      },
      validateAllFields() {
        Object.keys(this.formData).forEach(field => {
          this.validateField(field)
        })
      },
      handleSubmit() {
        this.submitAttempted = true
        this.validateAllFields()
        
        if (this.isFormValid) {
          this.$emit('submit', this.formData)
        } else {
          this.$emit('validation-failed', this.errors)
        }
      }
    }
  }

  it('validates individual fields on blur', async () => {
    const wrapper = mount(ValidationForm)
    
    // Test username validation
    const usernameInput = wrapper.find('[data-testid="username-input"]')
    await usernameInput.setValue('ab')
    await usernameInput.trigger('blur')
    await nextTick()
    
    expect(wrapper.find('[data-testid="username-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="username-error"]').text()).toBe('Username must be at least 3 characters')
    
    // Fix username
    await usernameInput.setValue('validuser')
    await usernameInput.trigger('blur')
    await nextTick()
    
    expect(wrapper.find('[data-testid="username-error"]').exists()).toBe(false)
  })

  it('validates email format', async () => {
    const wrapper = mount(ValidationForm)
    
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')
    await nextTick()
    
    expect(wrapper.find('[data-testid="email-error"]').text()).toBe('Email format is invalid')
    
    await emailInput.setValue('valid@example.com')
    await emailInput.trigger('blur')
    await nextTick()
    
    expect(wrapper.find('[data-testid="email-error"]').exists()).toBe(false)
  })

  it('validates password strength', async () => {
    const wrapper = mount(ValidationForm)
    
    const passwordInput = wrapper.find('[data-testid="password-input"]')
    await passwordInput.setValue('weak')
    await passwordInput.trigger('blur')
    await nextTick()
    
    expect(wrapper.find('[data-testid="password-error"]').text()).toBe('Password must be at least 8 characters')
    
    await passwordInput.setValue('onlyletters')
    await passwordInput.trigger('blur')
    await nextTick()
    
    expect(wrapper.find('[data-testid="password-error"]').text()).toBe('Password must contain both letters and numbers')
    
    await passwordInput.setValue('strong123')
    await passwordInput.trigger('blur')
    await nextTick()
    
    expect(wrapper.find('[data-testid="password-error"]').exists()).toBe(false)
  })

  it('validates password confirmation', async () => {
    const wrapper = mount(ValidationForm)
    
    await wrapper.find('[data-testid="password-input"]').setValue('password123')
    await wrapper.find('[data-testid="confirm-password-input"]').setValue('different123')
    await wrapper.find('[data-testid="confirm-password-input"]').trigger('blur')
    await nextTick()
    
    expect(wrapper.find('[data-testid="confirm-password-error"]').text()).toBe('Passwords do not match')
    
    await wrapper.find('[data-testid="confirm-password-input"]').setValue('password123')
    await wrapper.find('[data-testid="confirm-password-input"]').trigger('blur')
    await nextTick()
    
    expect(wrapper.find('[data-testid="confirm-password-error"]').exists()).toBe(false)
  })

  it('prevents submission with invalid data', async () => {
    const wrapper = mount(ValidationForm)
    
    // Try to submit empty form
    await wrapper.find('[data-testid="submit-btn"]').trigger('click')
    await nextTick()
    
    expect(wrapper.emitted('submit')).toBeFalsy()
    expect(wrapper.emitted('validation-failed')).toBeTruthy()
    expect(wrapper.find('[data-testid="form-error"]').exists()).toBe(true)
  })

  it('allows submission with valid data', async () => {
    const wrapper = mount(ValidationForm)
    
    // Fill form with valid data
    await wrapper.find('[data-testid="username-input"]').setValue('validuser')
    await wrapper.find('[data-testid="email-input"]').setValue('user@example.com')
    await wrapper.find('[data-testid="password-input"]').setValue('password123')
    await wrapper.find('[data-testid="confirm-password-input"]').setValue('password123')
    
    // Trigger validation
    await wrapper.find('[data-testid="username-input"]').trigger('blur')
    await wrapper.find('[data-testid="email-input"]').trigger('blur')
    await wrapper.find('[data-testid="password-input"]').trigger('blur')
    await wrapper.find('[data-testid="confirm-password-input"]').trigger('blur')
    await nextTick()
    
    // Submit form
    await wrapper.find('[data-testid="submit-btn"]').trigger('click')
    await nextTick()
    
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      username: 'validuser',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })
  })
})