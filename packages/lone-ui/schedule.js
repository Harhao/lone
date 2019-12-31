import { Master } from 'lone-messenger'

class Schedule {
  constructor ({ router, entry, mid }) {
    const vm = this
    vm.router = router
    vm.entry = entry
    this.master = new Master({
      mid: mid,
      env: 'worker',
      worker: new Worker(vm.entry.logic)
    })
    vm.logicEvents = {
      'logic:inited': function () {
        // Default Route Page
        vm.router.navigateTo(vm.router.routes[0].path)
      },
      'component:inited': function (channel, data) {
        vm.master.send('component:inited', channel, data)
      },
      'component:data': function (channel, data) {
        vm.master.send('component:data', channel, data)
      },
      'component:triggerParentEvent': function (channel, data) {
        vm.master.send('component:triggerParentEvent', channel, data)
      },
      'logic:navigateTo': function (channel, { url }) {
        vm.router.navigateTo(url)
      },
      'logic:redirectTo': function (channel, { url }) {
        vm.router.redirectTo(url)
      },
      'logic:navigateBack': function (channel, { delta }) {
        vm.router.navigateBack(delta)
      }
    }
    vm.pageEvents = {
      'page:navigateTo': function () {
        console.log('ui-schedule: view:navigateTo')
      },
      'page:inited': function (channel, data) {
        vm.master.send('ui:inited', channel, data)
      },
      'page:ready': function (channel, data) {
        vm.master.send('ui:ready', channel, data)
      },
      'page:triggerEvent': function (channel, data) {
        vm.master.send('ui:triggerEvent', channel, data)
      },
      'page:data': function (channel, data) {
        vm.master.send('ui:data', channel, data)
      },
      'page:beforeMount': function (channel, data) {
        vm.master.send('ui:beforeMount', channel, data)
      },
      'page:beforeUpdate': function (channel, data) {
        vm.master.send('ui:beforeUpdate', channel, data)
      },
      'page:updated': function (channel, data) {
        vm.master.send('ui:updated', channel, data)
      },
      'page:show': function (channel, data) {
        vm.master.send('ui:show', channel, data)
      },
      'page:hide': function (channel, data) {
        vm.master.send('ui:hide', channel, data)
      }
    }
    vm.init()
    vm.listenVisibilityChange(vm.router)
  }

  init () {
    this.listenEvents(this.master, this.logicEvents)
    this.listenEvents(this.master, this.pageEvents)
  }

  listenEvents (messenger, events) {
    for (const [event, fn] of Object.entries(events)) {
      messenger.onmessage(event, fn)
    }
  }

  listenVisibilityChange (router) {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        router.triggerCurrentPageShowHook()
      } else {
        router.triggerCurrentPageHideHook()
      }
    })
  }
}

export default Schedule
