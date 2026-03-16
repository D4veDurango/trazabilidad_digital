// Declaración de tipos para Capacitor en window
// Evita el error "Property 'Capacitor' does not exist on type 'Window'"

interface Window {
  Capacitor?: {
    isNativePlatform?: () => boolean;
    platform?: string;
  };
}
