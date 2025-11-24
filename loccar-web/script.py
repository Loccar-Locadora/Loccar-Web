from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def executar_fluxo(usuario, senha, abas):
    url_login = "http://localhost:4200/login"

    # Inicializa navegador
    driver = webdriver.Chrome()
    driver.get(url_login)

    # Login
    time.sleep(5)
    driver.find_element(By.ID, "email").send_keys(usuario)
    driver.find_element(By.ID, "password").send_keys(senha)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(40)

    # Acessar abas do usuário
    for aba in abas:
        driver.get(f"http://localhost:4200{aba}")
        time.sleep(2)

    driver.quit()
    time.sleep(2)


# -----------------------------
# 1º USUÁRIO (Administrador)
# -----------------------------
abas_usuario_1 = [
    "/dashboard",
    "/usuarios",
    "/veiculos"
]

executar_fluxo("joaobarreto@pagglo.com", "123123", abas_usuario_1)


# -----------------------------
# 2º USUÁRIO (Cliente)
# -----------------------------
abas_usuario_2 = [
    "/veiculos-disponiveis",
    "/minhas-reservas"
]

executar_fluxo("joao123@gmail.com", "123123", abas_usuario_2)
