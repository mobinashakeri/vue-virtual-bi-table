import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MTableRow from '../MTableRow.vue'

const headers = [
  { _id: 'title', label: 'Title', width: 100, sticky: true },
  { _id: 'age', label: 'Age', width: 80 },
]

const row = {
  _id: 't1',
  field: [
    { _id: 'title', value: 'Banana' },
    { _id: 'age', value: 30 },
  ],
}

describe('MTableRow', () => {
  it('renders each visible cell value', () => {
    const wrapper = mount(MTableRow, {
      props: { row, headers, shouldShowCell: () => true },
    })
    expect(wrapper.text()).toContain('Banana')
    expect(wrapper.text()).toContain('30')
  })

  it('skips cells that shouldShowCell rejects', () => {
    const wrapper = mount(MTableRow, {
      props: {
        row,
        headers,
        // only render the first column
        shouldShowCell: (_h: any, i: number) => i === 0,
      },
    })
    expect(wrapper.text()).toContain('Banana')
    expect(wrapper.text()).not.toContain('30')
  })

  it('renders a checkbox and emits toggle when selectable', async () => {
    const wrapper = mount(MTableRow, {
      props: { row, headers, shouldShowCell: () => true, selectable: true },
    })
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)

    await checkbox.setValue(true)
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })
})
