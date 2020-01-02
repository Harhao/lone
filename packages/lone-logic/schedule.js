import { triggerEvent, callHook } from './component/helper'
import { createComponentInstance } from './index'

export const instanceStorage = new Map()

export default function (slave) {
  const MESSENGER_EVENTS_UI = {
    'ui:inited': function ({ name, id, propsData, parentListeners }) {
      const vm = createComponentInstance(name, id, { propsData, parentListeners, slave })
      vm && instanceStorage.set(id, vm)
    },
    'ui:ready': function ({ id }) {
      const vm = instanceStorage.get(id)
      vm && callHook(vm, 'onReady')
      vm && callHook(vm, 'mounted')
    },
    'ui:triggerEvent': function ({ id, method, event }) {
      const vm = instanceStorage.get(id)
      vm && triggerEvent(vm, method, event)
    },
    'ui:data': function ({ id, data }) {
      const vm = instanceStorage.get(id)
      vm && vm.setData(data)
    },
    'ui:beforeMount': function ({ id }) {
      const vm = instanceStorage.get(id)
      vm && callHook(vm, 'beforeMount')
    },
    'ui:beforeUpdate': function ({ id }) {
      const vm = instanceStorage.get(id)
      vm && callHook(vm, 'beforeUpdate')
    },
    'ui:updated': function ({ id }) {
      const vm = instanceStorage.get(id)
      vm && callHook(vm, 'updated')
    },
    'ui:show': function ({ id }) {
      const vm = instanceStorage.get(id)
      vm && callHook(vm, 'onShow')
    },
    'ui:hide': function ({ id }) {
      const vm = instanceStorage.get(id)
      vm && callHook(vm, 'onHide')
    }
  }

  for (const [event, fn] of Object.entries(MESSENGER_EVENTS_UI)) {
    slave.onmessage(event, fn)
  }
}
