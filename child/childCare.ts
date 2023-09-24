import axios from 'axios';
import cron from 'node-cron';
import { ChildCare, connectToDatabase } from './dbConnect';


// Init
const baseUrl = 'https://data-api.myfranchise.kr/v1';
const headers = {
    accept: 'application/json',
};

// DB connect
connectToDatabase();

// Batch
cron.schedule('*/2 * * * *', async () => {
    console.log('#################################');
    console.log('###### Update Batch Start #######');
    console.log('#################################');

    await collectChildCareData();
});





// 업데이트 시점 기준 최신버전
let level: number = 0;

// 어린이집 최근정보
async function getLatestVersionId() {

    const response = await axios.get(baseUrl + '/school/childcare/latest/', {
        headers,
    });
    const latestVersionId = response.data.id;

    return latestVersionId;
};

// 어린이집 데이터 수집
async function collectChildCareData() {

    const latestVersionId = await getLatestVersionId();
    const existingData = await ChildCare.find({});
    let nextVersion: any;

    try {
        nextVersion = await axios.get(baseUrl + '/school/childcare/' + level + '/next/', {
            headers,
        });
    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            nextVersion = null;
        }
    }

    console.log("nextVersion : " + nextVersion)

    if (existingData.length === 0) {
        await collectChildCareVersions(1, latestVersionId);
    } else if (nextVersion && nextVersion.status === 200) {
        await collectChildCareVersions(level + 1, latestVersionId);
    } else {
        console.log('No Data to Update');
    }

};


async function collectChildCareVersions(startVersion: number, endVersion: number) {
    for (let version_pk = startVersion; version_pk <= endVersion; version_pk++) {
        try {
            const response = await axios.get(baseUrl + '/school/childcare/' + version_pk + '/', {
                headers,
            });
            const childcareDataArr = response.data.results;

            for (const childcareData of childcareDataArr) {
                const lng: number = parseFloat(childcareData.lng);
                const lat: number = parseFloat(childcareData.lat);

                const location = {
                    type: "Point",
                    coordinates: [lng, lat]
                };

                delete childcareData.lng;
                delete childcareData.lat;
                childcareData.location = location;

                await ChildCare.create(childcareData);
            }

            console.log('Saved childcare data for version : ' + version_pk);
            level = version_pk;
        } catch (error) {
            console.error('Error collecting and saving childcare data for version : ' + version_pk, error);
        }
    }
};



// 서울시에 있는 모든 어린이집 수 구하기
async function childCareInSeoul() {
    const childCareInSeoulCnt = await ChildCare.countDocuments({ address: { $regex: /서울/ }, });
    console.log('서울시에 있는 어린이집 수 : ' + childCareInSeoulCnt);
    return childCareInSeoulCnt;
};

// 반경 5km 이내 어린이집 구하기
async function childCareNearby() {
    const lng: number = 127.0393541;
    const lat: number = 37.5084279;

    const nearbyArr = await ChildCare.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], 5 / 6378.1]
            }
        }
    });

    const resultList = nearbyArr.map(item => item.name);
    console.log('◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎ 5km 이내 어린이집 데이터 ◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎ \n\n' + resultList.join('\n'));
};

// 멀티폴리곤
async function multiPolygon() {
    const multiPolygon = await ChildCare.find({
        location: {
            $geoWithin: {
                $polygon: [[127, 30], [127, 31], [127, 32]] // test
            }
        }
    });
    console.log(multiPolygon);
};






