import axios from 'axios';
import { ChildCare, connectToDatabase } from './dbConnect';
import terraformer from 'terraformer-wkt-parser'
import fs from 'fs';

const baseUrl = 'https://data-api.myfranchise.kr/v1';
const headers = {
    accept: 'application/json',
};

// 업데이트 최신 버전 확인
const latestVersion = async () => {
    try {
        const latestVersion = await ChildCare.findOne().sort({ version: -1 });
        return latestVersion;
    } catch (error) {
        console.log('Error finding latest Version', error);
        return null;
    }
    
}

// 어린이집 최근정보
const getLatestVersionId = async () => {
    try {
        const response = await axios.get(baseUrl + '/school/childcare/latest/', {
            headers,
        });
        const latestVersionId = response.data.id;
    
        return latestVersionId;    
    } catch (error) {
        console.error('Error finding latest version ID', error);
        return null;
    }
}

// 어린이집 데이터 수집
const collectChildCareData = async () => {
    const latestVersionId = await getLatestVersionId();
    const existingDataCnt = await ChildCare.countDocuments();
    let nextVersion: any;


    const latetVersion = await latestVersion();
    try {
        nextVersion = await axios.get(baseUrl + '/school/childcare/' + latetVersion + '/next/', {
            headers,
        });
    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            nextVersion = null;
        }
    }

    if (existingDataCnt == 0) {
        await collectChildCareVersions(1, latestVersionId);
    } else if (nextVersion && nextVersion.status === 200) {
        await collectChildCareVersions(nextVersion.data.id + 1, latestVersionId);
    } else {
        console.log('No Data to Update');
    }
}


const collectChildCareVersions = async (startVersion: number, endVersion: number) => {
    for (let version_pk = startVersion; version_pk <= endVersion; version_pk++) {
        try {
            const response = await axios.get(baseUrl + '/school/childcare/' + version_pk + '/', {
                headers,
            });
            const childcareDataArr = response.data.results;

            for await (const childcareData of childcareDataArr) {
                const lng: number = parseFloat(childcareData.lng);
                const lat: number = parseFloat(childcareData.lat);

                const location = {
                    type: "Point",
                    coordinates: [lng, lat]
                };

                delete childcareData.lng;
                delete childcareData.lat;
                childcareData.location = location;
                childcareData.version = version_pk;

                await ChildCare.create(childcareData);
            }

            console.log('Saved childcare data for version : ' + version_pk);
        } catch (error) {
            console.error('Error collecting and saving childcare data for version : ' + version_pk, error);
        }
    }
}



// 서울시에 있는 모든 어린이집 수 구하기
const childCareInSeoul = async () => {
    const childCareInSeoulCnt = await ChildCare.countDocuments({ address: /^서울특별시/ });
    console.log('서울시에 있는 어린이집 수 : ' + childCareInSeoulCnt);
    return childCareInSeoulCnt;
}

// 반경 5km 이내 어린이집 구하기
const childCareNearby = async () => {
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
}

// 멀티폴리곤
const multiPolygon = async () => {
    const filePaths = ['../utils/multiPolygon.wkt', '../utils/multiPolygon2.wkt']

    for await(const filePath of filePaths) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            const jsonData = data;
            const geoJson = terraformer.parse(jsonData);
            getChildCareWithinPolygon(geoJson);
        })
    }
}

const getChildCareWithinPolygon = async (polygonData: any) => {
    const childCareData = await ChildCare.find({
        location: {
            $geoWithin: {
                $geometry: polygonData
            }
        }
    }).exec();
    console.log(childCareData);
    return childCareData;
}

export {
    collectChildCareData,
    childCareInSeoul,
    childCareNearby,
    multiPolygon,
}