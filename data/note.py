# Python
# brew install python

# python 가상환경 생성
# $ python3 -m venv {가상환경 위치} (.venv)

# python 가상환경 활성화
# $ source {가상환경 위치}/bin/activate

# Python 가상환경 나가기
# $ deactivate

# 라이브러리 설치 
# pip3 install {libName}

# pip3 install -r requirement.txt

# 주피터 노트북 실행
# $ jupyter notebook


# TODO
# 


from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

def _get_production_driver(): 
    path='./chromedriver' # 구글 드라이버 설치 경로 지정
    chrome_options = webdriver.ChromeOptions()
    # chrome_options.add_argument("--headless")  # Head-less 설정
    # chrome_options.add_experimental_option("detach", True)
    chrome_options.add_argument("--single-process")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=chrome_options)
    return driver

driver = _get_production_driver()
driver.get('https://xn--v69ap5so3hsnb81e1wfh6z.com/map')

try :
    clickBtn = WebDriverWait(driver, 30).until(EC.element_to_be_clickable((By.XPATH, "/html/body/div[17]/div/span[2]")))
    clickBtn.send_keys(Keys.ENTER)
except Exception as e:
    print("error: ", type(e))


res = driver.find_element(By.ID,"map_list")
res.text