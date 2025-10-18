# 🚀 Guía Completa de Deployment en Vercel

## 📋 Pre-requisitos

✅ Contratos desplegados en Base Sepolia:
- Reputation: `0x66f8E781f0b714717c7B53dEa1acF7247b4B913b`
- Launchpad: `0xad6715C528F092D31010407C1D9Eb961A1aB545C`

✅ Cuenta de GitHub con el repositorio
✅ Cuenta de Vercel (gratis): https://vercel.com/signup

---

## 🎯 Opción 1: Deploy desde Vercel Dashboard (Recomendado)

### Paso 1: Hacer el repositorio público

```bash
# En tu terminal local
cd C:\Users\marti\Documents\Martin-Pulitano\project-base-batch
git add .
git commit -m "feat: improve UI/UX and prepare for production deployment"
git push origin main
```

**En GitHub**:
1. Ve a https://github.com/AitorFagoaga/project-base-batch
2. Click en **Settings** (esquina superior derecha)
3. Scroll hasta el final → **Danger Zone**
4. Click **Change visibility** → **Make public**
5. Confirma escribiendo el nombre del repo

### Paso 2: Conectar con Vercel

1. **Ir a Vercel**: https://vercel.com
2. **Login** con tu cuenta de GitHub
3. Click **Add New...** → **Project**
4. **Import Git Repository**:
   - Busca `project-base-batch`
   - Click **Import**

### Paso 3: Configurar el proyecto

En la página de configuración:

**Framework Preset**: Next.js (auto-detectado)

**Root Directory**: 
```
app
```
☑️ Marcar "Include source files outside of the Root Directory in the Build Step"

**Build Command**: (dejar por defecto)
```
npm run build
```

**Output Directory**: (dejar por defecto)
```
.next
```

**Install Command**: (dejar por defecto)
```
npm install
```

### Paso 4: Configurar Variables de Entorno

Click en **Environment Variables** y agrega:

```
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_REPUTATION_ADDRESS=0x66f8E781f0b714717c7B53dEa1acF7247b4B913b
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0xad6715C528F092D31010407C1D9Eb961A1aB545C
```

**Opcional** (si tienes WalletConnect Project ID):
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id_aqui
```

### Paso 5: Deploy

1. Click **Deploy**
2. Espera 2-3 minutos mientras construye
3. ¡Listo! 🎉

Tu app estará en: `https://project-base-batch.vercel.app` (o similar)

---

## 🎯 Opción 2: Deploy desde CLI (Avanzado)

### Paso 1: Instalar Vercel CLI

```powershell
npm install -g vercel
```

### Paso 2: Login en Vercel

```powershell
vercel login
```

Sigue las instrucciones en el navegador para autenticar.

### Paso 3: Deploy desde /app

```powershell
cd app
vercel
```

**Primera vez - Preguntas**:
```
? Set up and deploy "~/project-base-batch/app"? [Y/n] Y
? Which scope do you want to deploy to? [tu-username]
? Link to existing project? [y/N] N
? What's your project's name? meritocratic-launchpad
? In which directory is your code located? ./
```

### Paso 4: Configurar Environment Variables

```powershell
vercel env add NEXT_PUBLIC_CHAIN_ID
# Ingresa: 84532

vercel env add NEXT_PUBLIC_REPUTATION_ADDRESS
# Ingresa: 0x66f8E781f0b714717c7B53dEa1acF7247b4B913b

vercel env add NEXT_PUBLIC_LAUNCHPAD_ADDRESS
# Ingresa: 0xad6715C528F092D31010407C1D9Eb961A1aB545C
```

### Paso 5: Deploy a Producción

```powershell
vercel --prod
```

---

## ✅ Verificación Post-Deploy

### 1. Abrir la URL de producción

```
https://tu-proyecto.vercel.app
```

### 2. Verificar funcionalidades:

- [ ] Header y navegación se ven correctamente
- [ ] Conectar wallet funciona
- [ ] Página de proyectos carga
- [ ] Formulario de creación se ve bien
- [ ] Los colores y estilos son legibles

### 3. Probar transacción en producción:

1. Conecta wallet en Base Sepolia
2. Ve a "Create Project"
3. Llena el formulario con datos de prueba
4. Envía transacción
5. Verifica en BaseScan

### 4. Verificar en diferentes dispositivos:

- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (responsive)
- [ ] Tablet

---

## 🔧 Troubleshooting

### Error: "Build failed"

**Causa**: Errores de TypeScript o imports faltantes

**Solución**:
```powershell
# En local, dentro de /app
npm run build
```

Si falla localmente, arregla los errores antes de deploy.

### Error: "Environment variables not working"

**Solución**:
1. Ve a Vercel Dashboard → Tu proyecto
2. Settings → Environment Variables
3. Verifica que estén correctamente escritas
4. **Redeploy**: Deployments → Latest → ⋯ → Redeploy

### Error: "Contract read/write failed"

**Causa**: Direcciones de contratos incorrectas

**Solución**:
1. Verifica en `.env` local que las direcciones sean correctas
2. Actualiza en Vercel Dashboard → Settings → Environment Variables
3. Redeploy

### Página blanca / Error 500

**Causa**: Configuración incorrecta del Root Directory

**Solución**:
1. Vercel Dashboard → Settings → General
2. **Root Directory**: `app`
3. **Build Command**: `npm run build`
4. Save y redeploy

---

## 🎨 Customización de Dominio (Opcional)

### Si tienes un dominio propio:

1. Vercel Dashboard → Tu proyecto → **Settings** → **Domains**
2. Click **Add Domain**
3. Ingresa tu dominio (ej: `launchpad.tudominio.com`)
4. Sigue las instrucciones para configurar DNS

### Si quieres cambiar el subdominio de Vercel:

1. Settings → Domains
2. Click en el dominio `*.vercel.app`
3. Edit → Cambiar nombre
4. Ejemplo: `meritocratic-launchpad.vercel.app`

---

## 📊 Monitoreo y Analytics

### Vercel Analytics (Gratis):

1. Vercel Dashboard → Tu proyecto
2. **Analytics** tab
3. Ve métricas de:
   - Page views
   - Unique visitors
   - Performance (Web Vitals)

### Logs en tiempo real:

1. Deployments → Latest
2. **View Function Logs**
3. Ve errores y requests en vivo

---

## 🔄 Updates Automáticos

Vercel detecta automáticamente pushes a GitHub:

```bash
# Hacer cambios localmente
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel automáticamente:
# 1. Detecta el push
# 2. Construye la nueva versión
# 3. Deploya si el build es exitoso
```

### Preview Deployments:

Cada **Pull Request** genera un preview deployment automático:
- URL única para testing
- No afecta producción
- Se actualiza con cada commit al PR

---

## 🎯 Checklist Final

Después del deployment exitoso:

- [ ] URL de producción funcionando
- [ ] Variables de entorno configuradas
- [ ] Wallet connection funciona
- [ ] Transacciones se pueden hacer
- [ ] UI se ve correctamente (colores legibles)
- [ ] Responsive en mobile
- [ ] BaseScan links funcionan
- [ ] Actualizar README con live demo URL

---

## 📝 URLs Importantes

**Vercel Dashboard**: https://vercel.com/dashboard

**Tu proyecto**: `https://vercel.com/[tu-username]/[nombre-proyecto]`

**Documentación Vercel**: https://vercel.com/docs

**Vercel CLI Docs**: https://vercel.com/docs/cli

---

## 🆘 Soporte

Si encuentras problemas:

1. **Vercel Logs**: Dashboard → Deployments → View Function Logs
2. **Build Logs**: Click en el deployment → View Build Logs
3. **Vercel Discord**: https://discord.gg/vercel
4. **GitHub Issues**: Crear issue en tu repo

---

## 🎉 ¡Deployment Exitoso!

Una vez completado, tendrás:

✅ Frontend en producción 24/7
✅ HTTPS automático
✅ CDN global (carga rápida worldwide)
✅ Auto-deploy con Git pushes
✅ Analytics gratis
✅ Escalabilidad automática

**Tu Launchpad Meritocrático está LIVE! 🚀**

---

## 📌 Quick Commands Reference

```powershell
# Deploy preview
cd app
vercel

# Deploy producción
vercel --prod

# Ver logs
vercel logs

# Ver environment variables
vercel env ls

# Remover proyecto
vercel remove [nombre-proyecto]

# Abrir en navegador
vercel open
```

---

*Última actualización: 2025-10-18*
*Para Base Builder Track Submission*
