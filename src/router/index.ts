import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import FormLayout from '@/layouts/FormLayout.vue'
import { checkIsLoggedIn } from '@/utils/authHelper'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // --- STANDARD ROUTE GROUP ---
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '', // Renders at outscribed.com/
          name: 'Home',
          component: () => import('@/features/global/views/HomeView.vue'),
          meta: { requiresAuth: true }
        },
         {
          path: 'tasks', // Renders at outscribed.com/tasks
          name: 'AdminTasksList',
          component: () => import('@/features/global/views/AdminTaskListView.vue'),
          meta: { requiresAuth: true }
        },
         {
          path: 'my/tasks', // Renders at outscribed.com/tasks
          name: 'MyAdminTasksList',
          component: () => import('@/features/global/views/MyAdminTaskListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'logs', // Renders at outscribed.com/logs
          name: 'LogLists',
          component: () => import('@/features/logging/views/LogListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'analytics', // Renders at outscribed.com/analytics
          name: 'AnalyticsLists',
          component: () => import('@/features/analytics/views/AnalyticsListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'admins', // Renders at outscribed.com/admins
          name: 'AdminLists',
          component: () => import('@/features/gatekeeper/views/AdminListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'verifications', // Renders at outscribed.com/verifications
          name: 'VerificationLists',
          component: () => import('@/features/gatekeeper/views/VerificationListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'comments', // Renders at outscribed.com/comments
          name: 'CommentLists',
          component: () => import('@/features/engagement/views/CommentListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'favorites', // Renders at outscribed.com/favorites
          name: 'FavoriteLists',
          component: () => import('@/features/engagement/views/FavoriteListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'flags', // Renders at outscribed.com/flags
          name: 'FlagLists',
          component: () => import('@/features/engagement/views/FlagListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'shares', // Renders at outscribed.com/shares
          name: 'ShareLists',
          component: () => import('@/features/engagement/views/ShareListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'snapshots', // Renders at outscribed.com/snapshots
          name: 'SnapshotLists',
          component: () => import('@/features/engagement/views/SnapshotListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'votes', // Renders at outscribed.com/votes
          name: 'VoteLists',
          component: () => import('@/features/engagement/views/VoteListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'users', // Renders at outscribed.com/users
          name: 'UserLists',
          component: () => import('@/features/identity/views/UserListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'insights', // Renders at outscribed.com/insights
          name: 'InsightLists',
          component: () => import('@/features/insights/views/InsightListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'tales', // Renders at outscribed.com/tales
          name: 'TaleLists',
          component: () => import('@/features/tales/views/TaleListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'faqs', // Renders at outscribed.com/faqs
          name: 'FaqLists',
          component: () => import('@/features/support/views/FaqListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'inquiries', // Renders at outscribed.com/inquiries
          name: 'InquiryLists',
          component: () => import('@/features/support/views/InquiryListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'tags', // Renders at outscribed.com/tags
          name: 'TagLists',
          component: () => import('@/features/tagging/views/TagListView.vue'),
          meta: { requiresAuth: true }
        },
          {
          path: 'writers', // Renders at outscribed.com/writers
          name: 'WriterLists',
          component: () => import('@/features/authoring/views/WriterListView.vue'),
          meta: { requiresAuth: true }
        }
       
      ]
    },
    {
      // --- FORM WORKFLOW ROUTE GROUP ---
      path: '/',
      component: FormLayout,
      children: [
        {
          path: 'register', // Renders at outscribed.com/register
          name: 'RegisterUser',
          component: () => import('@/features/gatekeeper/views/RegisterView.vue')
        },
        {
          // 🎯 Use :accountId to match the dynamic Ulid string in the path
          path: '/challenge/:accountId',
          name: 'ChallengeFactor',
          component: () => import('@/features/gatekeeper/views/ChallengeView.vue')
        },
         {
          path: 'login/:accountId', // Renders at outscribed.com/login
          name: 'LoginUser',
          component: () => import('@/features/gatekeeper/views/LoginView.vue')
        },
      {
          path: 'logout', // Renders at outscribed.com/logout
          name: 'LogoutUser',
          component: () => import('@/features/gatekeeper/views/LogoutView.vue')
        },
        {
          path: 'fallback', // Renders at outscribed.com/fallback
          name: 'FallbackLogin',
          component: () => import('@/features/gatekeeper/views/FallbackView.vue')
        },
      ]
    }
  ]
})

router.onError((error, to) => {
  if (error.message.includes('Failed to fetch dynamically imported module') || 
      error.message.includes('error loading dynamically imported module')) {
    // Force a reload to grab the newest Vite asset hashes
    window.location.href = to.fullPath;
  }
});

// src/router/index.ts
router.beforeEach((to, from) => {
  const hasUserHint = checkIsLoggedIn()

  if (to.meta.requiresAuth && !hasUserHint) {
    console.warn(`🔒 [Router]: Intercepted navigation to protected resource.`)
    
    // 🎯 Simply RETURN the target route configuration object directly
    return { 
      name: 'RegisterUser', 
      query: { 
        returnUrl: to.fullPath,
        context: to.meta.authContext as string
      } 
    }
  }

  // 🟢 If authentication passes, returning undefined or true allows navigation to proceed
  return true 
})

export default router
