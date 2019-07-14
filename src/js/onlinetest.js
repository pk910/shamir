(function () {
    window.addEventListener('load', function () {
        function updateOnlineStatus(event) {
            console.log('status changed')

            var condition = navigator.onLine ? 'online' : 'offline';
            var online = document.getElementById("online-alert")
            var offline = document.getElementById("offline-alert")

            if (condition === 'offline') {
                online.classList.add('hidden')
                offline.classList.remove('hidden')
            } else {
                online.classList.remove('hidden')
                offline.classList.add('hidden')
            }
        }

        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        updateOnlineStatus()
    })
})();
