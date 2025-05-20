from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

# URL de ejemplo: Cyberpunk 2077
url = "https://store.steampowered.com/app/1091500/Cyberpunk_2077/"

# Configuración de Chrome en modo headless
options = Options()
# options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

# Iniciar navegador
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.get(url)

try:
    # Esperamos unos segundos a que se cargue el contenido
    time.sleep(5)

    # Buscar el texto de fecha de oferta
    elem = driver.find_element(By.CLASS_NAME, "game_purchase_discount_countdown")
    print("✅ Fecha encontrada:", elem.text)
except Exception as e:
    print("❌ No se encontró el elemento:", e)

driver.quit()
