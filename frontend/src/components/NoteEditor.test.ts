import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteEditor from './NoteEditor.vue'
import type { Note } from '@/types'

describe('NoteEditor', () => {
  const sampleNote: Note = {
    id: '1',
    title: 'Existing Title',
    body: 'Existing body content',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  }

  it('renders empty fields in create mode (no note prop)', () => {
    const wrapper = mount(NoteEditor)
    const titleInput = wrapper.find('#note-title')
    const bodyTextarea = wrapper.find('#note-body')

    expect((titleInput.element as HTMLInputElement).value).toBe('')
    expect((bodyTextarea.element as HTMLTextAreaElement).value).toBe('')
  })

  it('pre-populates fields when note prop is provided (edit mode)', () => {
    const wrapper = mount(NoteEditor, {
      props: { note: sampleNote },
    })
    const titleInput = wrapper.find('#note-title')
    const bodyTextarea = wrapper.find('#note-body')

    expect((titleInput.element as HTMLInputElement).value).toBe('Existing Title')
    expect((bodyTextarea.element as HTMLTextAreaElement).value).toBe('Existing body content')
  })

  it('shows validation error when title is empty on submit', async () => {
    const wrapper = mount(NoteEditor)
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('#title-error').exists()).toBe(true)
    expect(wrapper.find('#title-error').text()).toContain('Title is required')
  })

  it('shows validation error when title exceeds 200 characters', async () => {
    const wrapper = mount(NoteEditor)
    const titleInput = wrapper.find('#note-title')
    await titleInput.setValue('a'.repeat(201))
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('#title-error').exists()).toBe(true)
    expect(wrapper.find('#title-error').text()).toContain('200')
  })

  it('shows validation error when body exceeds 10000 characters', async () => {
    const wrapper = mount(NoteEditor)
    const titleInput = wrapper.find('#note-title')
    const bodyTextarea = wrapper.find('#note-body')

    await titleInput.setValue('Valid title')
    await bodyTextarea.setValue('a'.repeat(10001))
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('#body-error').exists()).toBe(true)
    expect(wrapper.find('#body-error').text()).toContain('10000')
  })

  it('emits save with trimmed title and body on valid submission', async () => {
    const wrapper = mount(NoteEditor)
    const titleInput = wrapper.find('#note-title')
    const bodyTextarea = wrapper.find('#note-body')

    await titleInput.setValue('  My Note Title  ')
    await bodyTextarea.setValue('Some body content')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')![0]).toEqual([
      { title: 'My Note Title', body: 'Some body content' },
    ])
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(NoteEditor)
    const cancelButton = wrapper.find('button[type="button"]')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('displays apiError when prop is provided', () => {
    const wrapper = mount(NoteEditor, {
      props: { apiError: 'Failed to save note' },
    })

    expect(wrapper.find('.api-error').exists()).toBe(true)
    expect(wrapper.find('.api-error').text()).toBe('Failed to save note')
  })

  it('retains user input after validation failure', async () => {
    const wrapper = mount(NoteEditor)
    const titleInput = wrapper.find('#note-title')
    const bodyTextarea = wrapper.find('#note-body')

    await titleInput.setValue('')
    await bodyTextarea.setValue('My body content that should be retained')
    await wrapper.find('form').trigger('submit')

    // Validation fails for empty title
    expect(wrapper.find('#title-error').exists()).toBe(true)
    // Body input is retained
    expect((bodyTextarea.element as HTMLTextAreaElement).value).toBe(
      'My body content that should be retained'
    )
  })

  it('retains user input when apiError is shown', async () => {
    const wrapper = mount(NoteEditor, {
      props: { apiError: 'Server error' },
    })
    const titleInput = wrapper.find('#note-title')
    const bodyTextarea = wrapper.find('#note-body')

    await titleInput.setValue('My title')
    await bodyTextarea.setValue('My body')

    // Re-render with same apiError — fields should keep values
    await wrapper.setProps({ apiError: 'Updated error' })

    expect((titleInput.element as HTMLInputElement).value).toBe('My title')
    expect((bodyTextarea.element as HTMLTextAreaElement).value).toBe('My body')
  })

  it('updates fields when note prop changes', async () => {
    const wrapper = mount(NoteEditor, {
      props: { note: sampleNote },
    })

    const updatedNote: Note = {
      ...sampleNote,
      title: 'Updated Title',
      body: 'Updated body',
    }

    await wrapper.setProps({ note: updatedNote })

    const titleInput = wrapper.find('#note-title')
    const bodyTextarea = wrapper.find('#note-body')
    expect((titleInput.element as HTMLInputElement).value).toBe('Updated Title')
    expect((bodyTextarea.element as HTMLTextAreaElement).value).toBe('Updated body')
  })

  it('has accessible form with proper labels and aria attributes', () => {
    const wrapper = mount(NoteEditor)

    const form = wrapper.find('form')
    expect(form.attributes('aria-label')).toBe('Note editor')

    const titleInput = wrapper.find('#note-title')
    expect(titleInput.exists()).toBe(true)
    expect(wrapper.find('label[for="note-title"]').exists()).toBe(true)

    const bodyTextarea = wrapper.find('#note-body')
    expect(bodyTextarea.exists()).toBe(true)
    expect(wrapper.find('label[for="note-body"]').exists()).toBe(true)
  })

  it('sets aria-invalid on fields with errors', async () => {
    const wrapper = mount(NoteEditor)
    await wrapper.find('form').trigger('submit')

    const titleInput = wrapper.find('#note-title')
    expect(titleInput.attributes('aria-invalid')).toBe('true')
  })
})
