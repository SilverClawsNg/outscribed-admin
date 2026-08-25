<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'

// 1. Structural Imports - Forms & Modals mapped precisely to your architectural directories
import LogListFilterModal from '@/features/logging/modals/LogListFilterModal.vue'
import AnalyticsListFilterModal from '@/features/analytics/modals/AnalyticsListFilterModal.vue'
import AdminListFilterModal from '@/features/gatekeeper/modals/AdminListFilterModal.vue'
import VerificationListFilterModal from '@/features/gatekeeper/modals/VerificationListFilterModal.vue'
import CommentListFilterModal from '@/features/engagement/modals/CommentListFilterModal.vue'
import FavoriteListFilterModal from '@/features/engagement/modals/FavoriteListFilterModal.vue'
import FlagListFilterModal from '@/features/engagement/modals/FlagListFilterModal.vue'
import ShareListFilterModal from '@/features/engagement/modals/ShareListFilterModal.vue'
import VoteListFilterModal from '@/features/engagement/modals/VoteListFilterModal.vue'
import UserListFilterModal from '@/features/identity/modals/UserListFilterModal.vue'
import InsightListFilterModal from '@/features/insights/modals/InsightListFilterModal.vue'
import TaleListFilterModal from '@/features/tales/modals/TaleListFilterModal.vue'
import FaqListFilterModal from '@/features/support/modals/FaqListFilterModal.vue'
import InquiryListFilterModal from '@/features/support/modals/InquiryListFilterModal.vue'
import TagListFilterModal from '@/features/tagging/modals/TagListFilterModal.vue'
import WriterListFilterModal from '@/features/authoring/modals/WriterListFilterModal.vue'
import SnapshotListFilterModal from '@/features/engagement/modals/SnapshotListFilterModal.vue'


import AnalyticsDetailModal from '@/features/analytics/modals/AnalyticsDetailModal.vue'
import TaleDetailModal from '@/features/tales/modals/TaleDetailModal.vue'
import InsightDetailModal from '@/features/insights/modals/InsightDetailModal.vue'
import CommentDetailModal from '@/features/engagement/modals/CommentDetailModal.vue'
import FlagDetailModal from '@/features/engagement/modals/FlagDetailModal.vue'
import VoteDetailModal from '@/features/engagement/modals/VoteDetailModal.vue'
import FavoriteDetailModal from '@/features/engagement/modals/FavoriteDetailModal.vue'
import ShareDetailModal from '@/features/engagement/modals/ShareDetailModal.vue'
import UserDetailModal from '@/features/identity/modals/UserDetailModal.vue'
import WriterDetailModal from '@/features/authoring/modals/WriterDetailModal.vue'
import SnapshotDetailModal from '@/features/engagement/modals/SnapshotDetailModal.vue'
import SnapshotListModal from '@/features/engagement/modals/SnapshotListModal.vue'

import SuspendWriterModal from '@/features/authoring/modals/SuspendWriterModal.vue'
import ReinstateWriterModal from '@/features/authoring/modals/ReinstateWriterModal.vue'

import ArchiveCommentModal from '@/features/engagement/modals/ArchiveCommentModal.vue'
import HideCommentModal from '@/features/engagement/modals/HideCommentModal.vue'
import CertifyCommentModal from '@/features/engagement/modals/CertifyCommentModal.vue'

import ArchiveInsightModal from '@/features/insights/modals/ArchiveInsightModal.vue'
import HideInsightModal from '@/features/insights/modals/HideInsightModal.vue'
import CertifyInsightModal from '@/features/insights/modals/CertifyInsightModal.vue'

import ArchiveTaleModal from '@/features/tales/modals/ArchiveTaleModal.vue'
import HideTaleModal from '@/features/tales/modals/HideTaleModal.vue'
import CertifyTaleModal from '@/features/tales/modals/CertifyTaleModal.vue'

import AssignRoleModal from '@/features/identity/modals/AssignRoleModal.vue'
import SuspendUserModal from '@/features/identity/modals/SuspendUserModal.vue'
import ReinstateUserModal from '@/features/identity/modals/ReinstateUserModal.vue'
import BanUserModal from '@/features/identity/modals/BanUserModal.vue'

import ReassignRoleModal from '@/features/gatekeeper/modals/ReassignRoleModal.vue'
import ActivateRoleModal from '@/features/gatekeeper/modals/ActivateRoleModal.vue'
import DeactivateRoleModal from '@/features/gatekeeper/modals/DeactivateRoleModal.vue'
import ResetSecurityStatusModal from '@/features/gatekeeper/modals/ResetSecurityStatusModal.vue'

import AdminDetailModal from '@/features/gatekeeper/modals/AdminDetailModal.vue'
import VerificationDetailModal from '@/features/gatekeeper/modals/VerificationDetailModal.vue'


import InquiryDetailModal from '@/features/support/modals/InquiryDetailModal.vue'
import AnswerInquiryModal from '@/features/support/modals/AnswerInquiryModal.vue'
import ProblemDefinitionModal from '@/features/support/modals/ProblemDefinitionModal.vue'

import LogDetailModal from '@/features/logging/modals/LogDetailModal.vue'
import TagDetailModal from '@/features/tagging/modals/TagDetailModal.vue'

import RegisterModal from '@/features/gatekeeper/modals/RegisterModal.vue'
import ChallengeModal from '@/features/gatekeeper/modals/ChallengeModal.vue'
import LoginModal from '@/features/gatekeeper/modals/LoginModal.vue'


const modalStore = useModalStore()
const isExpandModal = ref(false)

// 2. Dynamic Component Dictionary Map (Replaces the large C# @switch block)
const componentMap: Record<string, any> = {
LogListFilter: LogListFilterModal,
AnalyticsListFilter: AnalyticsListFilterModal,
AdminListFilter: AdminListFilterModal,
VerificationListFilter: VerificationListFilterModal,
CommentListFilter: CommentListFilterModal,
FavoriteListFilter: FavoriteListFilterModal,
FlagListFilter: FlagListFilterModal,
ShareListFilter: ShareListFilterModal,
VoteListFilter: VoteListFilterModal,
UserListFilter: UserListFilterModal,
InsightListFilter: InsightListFilterModal,
TaleListFilter: TaleListFilterModal,
FaqListFilter: FaqListFilterModal,
InquiryListFilter: InquiryListFilterModal,
TagListFilter: TagListFilterModal,
TaleDetail: TaleDetailModal,
InsightDetail: InsightDetailModal,
CommentDetail: CommentDetailModal,
FlagDetail: FlagDetailModal,
VoteDetail: VoteDetailModal,
FavoriteDetail: FavoriteDetailModal,
ShareDetail: ShareDetailModal,
UserDetail: UserDetailModal,
WriterListFilter: WriterListFilterModal,
WriterDetail: WriterDetailModal,
SuspendWriter: SuspendWriterModal,
ReinstateWriter: ReinstateWriterModal,
ArchiveComment: ArchiveCommentModal,
HideComment: HideCommentModal,
CertifyComment: CertifyCommentModal,
ArchiveInsight: ArchiveInsightModal,
HideInsight: HideInsightModal,
CertifyInsight: CertifyInsightModal,
ArchiveTale: ArchiveTaleModal,
HideTale: HideTaleModal,
CertifyTale: CertifyTaleModal,
AssignRole: AssignRoleModal,
SuspendUser: SuspendUserModal,
ReinstateUser: ReinstateUserModal,
BanUser: BanUserModal,
ReassignRole: ReassignRoleModal,
ActivateRole: ActivateRoleModal,
DeactivateRole: DeactivateRoleModal,
ResetSecurityStatus: ResetSecurityStatusModal,
AdminDetail: AdminDetailModal,
VerificationDetail: VerificationDetailModal,
SnapshotDetail: SnapshotDetailModal,
InquiryDetail: InquiryDetailModal,
AnswerInquiry: AnswerInquiryModal,
AnalyticsDetail: AnalyticsDetailModal,
LogDetail: LogDetailModal,
TagDetail: TagDetailModal,
ProblemDefinition: ProblemDefinitionModal,
Register: RegisterModal,
Challenge: ChallengeModal,
Login: LoginModal,
SnapshotListFilter: SnapshotListFilterModal,
SnapshotList: SnapshotListModal
}

// Helper getter to deliver the raw payload directly without flattening
function getComponentProps(windowItem: any) {
  // Always returns a stable, consistent root prop wrapper
  return {
    payload: windowItem.payload ?? null
  }
}

// 3. Coordinate CSS Transition Frames with the Pinia State Manager
async function onAnimationEnd(windowItem: any) {
  // Clear enter flag after entrance finishes
  if (windowItem.isEntering && !windowItem.isLeaving) {
    windowItem.isEntering = false
    return
  }

  // Only purge instance state records from the stack collection array after fade transitions complete
  if (windowItem.isLeaving) {
    modalStore.remove(windowItem)
  }
}
</script>

<template>

  <div id="modal" :class="{ open: modalStore.isOpen }">
    
    <div 
      class="close-modal-wrapper" 
      :class="{ active: modalStore.isContainerOpen }"
      @click="modalStore.closeAll()"
    ></div>

    <div class="inner-modal" :class="{ expand: isExpandModal }">
      
      <template v-if="modalStore.modalStack.length > 0">
        <div 
          v-for="(windowItem, index) in modalStore.modalStack" 
          :key="windowItem.id"
          class="modal-contents"
          :class="{
            'leave': windowItem.isLeaving,
            'enter top': windowItem.isEntering && index === 0,
            'top': !windowItem.isEntering && !windowItem.isLeaving && index === 0,
            'background': index > 0
          }"
          :style="{ zIndex: 1000 + modalStore.stackDepth - index }"
          @animationend="onAnimationEnd(windowItem)"
        >
          
          <div class="modal-header">
            <div class="inner-modal-header">
              
              <button class="close" @click="modalStore.closeAll()">
                <SvgIcons name="back-arrow" />
                <span>{{ windowItem.title }}</span>
              </button>

              <div class="modal-header-menu">
                <button 
                  :class="isExpandModal ? 'maximize' : 'minimize'" 
                  @click="isExpandModal = !isExpandModal"
                >
                  <SvgIcons :name="isExpandModal ? 'maximize' : 'minimize'" />
                </button>

                <button class="close" @click="modalStore.cancel()">X</button>
              </div>

            </div>
          </div>

          <div class="modal-body">
            <div class="inner-modal-body">
              
              <component 
                :is="componentMap[windowItem.type] || componentMap['ModalError']"
                v-bind="getComponentProps(windowItem)"
                @success="windowItem.onSuccessCallback ? windowItem.onSuccessCallback() : null"
              />

              <p class="buffer"></p>
            </div>
          </div>

        </div>
      </template>

    </div>
  </div>
</template>

<style lang="less" scoped>
/* Scoped less styling configurations mapping directly onto your standard layout keys */
@import "../assets/css/modal.less";
</style>