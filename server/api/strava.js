
const https = require('https')
const fs = require('fs')

class StravaSportsDataCollector{
    constructor() {
    }

    loadTestData(callback) {
        return new Promise((resolve, reject) => {
            fs.readFile('strava_data.json', 'utf8' , (err, data) => {
                if (err) {
                    // todo error logger
                    console.error(err)
                    reject(err)
                    return
                }
                resolve(callback(data))
            })
        })
    }

    static extractActivityCoreElements(activity) {
        var name = activity.name
        var startDate = activity.start_date
        var movingTime = activity.moving_time / (60*60)
        var id = activity.id

        return [id, name, startDate, movingTime]
    }

    static activityTimeFilter(activity) {
        var activityDate = Date.parse(activity.start_date)
        var today = new Date();
        // timeDistance in hours (original difference value: miliseconds)
        var timeDistance = (today - activityDate) / (60*60*1000)

        // todo: put compare value / sliding window into config
        return timeDistance < (24*14)
    }

    handleSportsData(activityData) {
        //console.log(activityData)
        var selectedActvities = []
        var parsedActivityData = JSON.parse(activityData)
        var filteredActivities = parsedActivityData.filter(StravaSportsDataCollector.activityTimeFilter)
        for (let activity of filteredActivities) {
            var data = StravaSportsDataCollector.extractActivityCoreElements(activity)
            selectedActvities.push(data)
        }

        console.log("Activities in considered time interval: " + filteredActivities.length)
        return selectedActvities
    }

    async queryActivityData(athleteAccessToken, callback) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'www.strava.com',
                port: 443,
                path: '/api/v3/athlete/activities?access_token=' + athleteAccessToken,
                method: 'GET'
            }

            // server response
            var response = ""
            const req = https.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`)

                res.on('data', d => {
                    // gather sports response data (activity data is too large for one single packet, therefore we need to sample it back from the packets)
                    // console.log("-- data event --\n")
                    response += d
                })

                res.on('end', d => {
                    // console.log("-- end event --\n")
                    // after response transmission completed, process it
                    if (res.statusCode == 200) {
                        resolve(callback(response))
                    }
                })
            })

            req.on('error', error => {
                // TODO: use logger
                console.error(error)
                reject(error)
            })

            req.end()
        })
    }


    getStastics(activities) {
        var sumSportsHours = 0
        for (var activity of activities) {
            sumSportsHours += activity[3]
        }
        return [activities.length, sumSportsHours]
    }

    async getSportsStatistics(athleteAccessToken) {
        // todo: put access code into config
        var selectedActvities = await this.queryActivityData(athleteAccessToken, this.handleSportsData)
        // selectedActvities = await loadTestData(handleSportsData)
        // console.log(selectedActvities)
        var activityStatistics = this.getStastics(selectedActvities)
        return activityStatistics
    }
}


stravaCon = new StravaSportsDataCollector()
var athlete1Token = "f6d0bf2f956be3bc66f082192c412760ee5df9a7"
console.log("stats:")
stravaCon.getSportsStatistics(athlete1Token)
    .then((stats) => {console.log(stats)})

// get new access token (valid for 6 h)
// command:
// curl -X POST "https://www.strava.com/oauth/token" -F "client_id=59386" -F "client_secret=27d294934a5246889b33d591bf8818af2941a5b2" -F "refresh_token=fe5576ae90d96d619de120ce07ed9348a23c8a70" -F "grant_type=refresh_token"