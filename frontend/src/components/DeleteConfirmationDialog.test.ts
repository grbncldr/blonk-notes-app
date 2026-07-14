import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'
import type { Note } from '@/types'

const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  body: 'Some body text',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T11:00:00Z',
}

describe('DeleteConfirmationDialog', () => {
  it('displays the note title in the confirmation message', () => {
    const wrapper = mount(DeleteConfirmationDialog, {
      props: { note: mockNote },
    })

    expect(wrapper.text()).toContain("Are you sure you want to delete 'Test Note'?")
  })

  it('renders with role="dialog" and aria-modal="true"', () => {
    const wrapper = mount(DeleteConfirmationDialog, {
      props: { note: mockNote },
    })

    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.exists()).toBe(true)
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('delete-dialog-title')
  })

  it('emits "cancel" when Cancel button is clicked', async () => {
    const wrapper = mount(DeleteConfirmationDialog, {
      props: { note: mockNote },
    })

    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emits "confirm" when Delete button is clicked', async () => {
    const wrapper = mount(DeleteConfirmationDialog, {
      props: { note: mockNote },
    })

    await wrapper.find('.btn-delete').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits "cancel" when overlay background is clicked', async () => {
    const wrapper = mount(DeleteConfirmationDialog, {
      props: { note: mockNote },
    })

    await wrapper.find('.overlay').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
