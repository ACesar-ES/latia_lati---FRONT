# Latia · Familia y cambio de perfil

Base: `master@f2f3f65`. Implementación Angular standalone con servicios HttpClient, Reactive Forms, Validators, MatSelect, MatDatepicker y MatTable. No requiere migraciones.

## Probar en clase

1. En una cuenta de prueba, abre **Familia** y, si no tienes ficha propia, elige **Completar mi perfil**. Después de guardar vuelve a Familia.
2. Usa **Agregar madre** y **Agregar hijo/a**. La titular de la cuenta sigue en el centro. Usa **Agregar vínculo** en un progenitor para situar a los abuelos.
3. En la vista **Lista** también aparecen perfiles que todavía no tienen vínculos. Puedes unir dos fichas existentes sin volver a crear a la persona.
4. Abre el selector del encabezado. Cambia de perfil y entra en **Ver historial**. Cambiar desde el historial lleva directamente al historial del nuevo perfil.
5. Recarga la pestaña y verifica que se conserva la selección. Cierra sesión y entra con otra cuenta: no debe quedar la familia anterior.
6. Ejecuta `npm ci`, `npm run build` y `npm test -- --watch=false --include="**/family*.spec.ts"`. Para abrir la aplicación: `npm start`.

## Contrato con el backend del equipo

- `GET /api/healthprofiles/consulta-nativa` devuelve perfiles del propietario. Su ficha propia es la que lo tiene también como titular. Un 404 de esta consulta se interpreta como lista vacía.
- Los vínculos usan `GET /api/familyrelationships/perfil/{id}` y `POST /api/familyrelationships`. El parentesco describe al familiar respecto del perfil de referencia.
- Si crear el perfil sí funciona pero crear el vínculo falla, el formulario permite reintentar solo el vínculo. Tras una desconexión, revisa los perfiles existentes antes de crear otro.
- La ficha sin titular no admite un nombre en el DTO actual. El nombre de uso es opcional y solo se recuerda en la pestaña, separado por cuenta. No se guardan historias clínicas en sessionStorage.
- La API de historiales devuelve la colección global. El frontend filtra lo que muestra, pero **el servidor debe verificar propietario y perfil en cada lectura y escritura** antes de usar datos reales. Para la presentación utiliza datos ficticios.
- En esta entrega cambian Familia, el selector y el Historial. Agenda, Medicamentos y Lati conservan su comportamiento anterior.
