import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NotesListView from './NotesListView.vue'
import { useNotesStore } from '@/store/notes'

vi.mock('@/api/client', () => ({
  ApiClient: {
    getNotes: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  },
}))

describe('NotesListView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows loading indicator while fetching', async () => {
    const wrapper = mount(NotesListView)
    const store = useNotesStore()
    store.loading = true

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.notes-loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading notes...')
  })

  it('shows error state with retry button on fetch failure', async () => {
    const wrapper = mount(NotesListView)
    const store = useNotesStore()
    store.error = 'Could not load notes'
    store.loading = false

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.notes-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Could not load notes')
    expect(wrapper.find('.retry-button').exists()).toBe(true)
  })

  it('shows empty state when no notes exist', async () => {
    const wrapper = mount(NotesListView)
    const store = useNotesStore()
    store.loading = false
    store.error = null
    store.notes = []

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.notes-empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('No notes yet. Create your first note!')
  })

  it('renders notes with truncated title and body', async () => {
    const wrapper = mount(NotesListView)
    const store = useNotesStore()
    store.loading = false
    store.error = null
    store.notes = [
      {
        id: '1',
        title: 'A'.repeat(60),
        body: 'B'.repeat(150),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        id: '2',
        title: 'Short title',
        body: 'Short body',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
      },
    ]

    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('.note-item')
    expect(items).toHaveLength(2)

    // First note: title truncated to 50 + "...", body truncated to 120 + "..."
    const firstTitle = items[0].find('.note-title')
    expect(firstTitle.text()).toBe('A'.repeat(50) + '...')
    const firstBody = items[0].find('.note-body')
    expect(firstBody.text()).toBe('B'.repeat(120) + '...')

    // Second note: short, no truncation
    const secondTitle = items[1].find('.note-title')
    expect(secondTitle.text()).toBe('Short title')
    const secondBody = items[1].find('.note-body')
    expect(secondBody.text()).toBe('Short body')
  })

  it('calls fetchNotes on mount', () => {
    const store = useNotesStore()
    const fetchSpy = vi.spyOn(store, 'fetchNotes').mockResolvedValue()

    mount(NotesListView)

    expect(fetchSpy).toHaveBeenCalledOnce()
  })

  it('retry button calls fetchNotes again', async () => {
    const wrapper = mount(NotesListView)
    const store = useNotesStore()
    store.loading = false
    store.error = 'Network error'

    await wrapper.vm.$nextTick()

    const fetchSpy = vi.spyOn(store, 'fetchNotes').mockResolvedValue()
    await wrapper.find('.retry-button').trigger('click')

    expect(fetchSpy).toHaveBeenCalled()
  })

  it('has appropriate ARIA attributes', async () => {
    const wrapper = mount(NotesListView)
    const store = useNotesStore()
    store.loading = false
    store.error = null
    store.notes = [
      {
        id: '1',
        title: 'Test',
        body: 'Content',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.notes-list').attributes('aria-label')).toBe('Notes')
  })

  it('loading state has role="status" and aria-live', async () => {
    const wrapper = mount(NotesListView)
    const store = useNotesStore()
    store.loading = true

    await wrapper.vm.$nextTick()

    const loading = wrapper.find('.notes-loading')
    expect(loading.attributes('role')).toBe('status')
    expect(loading.attributes('aria-live')).toBe('polite')
  })

  it('error state has role="alert"', async () => {
    const wrapper = mount(NotesListView)
    const store = useNotesStore()
    store.loading = false
    store.error = 'Some error'

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.notes-error').attributes('role')).toBe('alert')
  })
})
