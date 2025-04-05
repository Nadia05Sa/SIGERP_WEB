// AlertService.js
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';

/**
 * AlertService - Servicio para mostrar notificaciones y diálogos
 */
const AlertService = {
    /**
     * Muestra un diálogo de confirmación
     */
    showDialog: (type, title, message, onConfirm, onCancel) => {
        Dialog.show({
            type: type || ALERT_TYPE.SUCCESS,
            title: title || 'Confirmación',
            textBody: message,
            button: 'Confirmar',
            onPressButton: onConfirm,
            cancelButton: 'Cancelar',
            onPressCancelButton: onCancel
        });
    },
    
    /**
     * Muestra una notificación toast
     */
    showToast: (type, title, message) => {
        Toast.show({
            type: type || ALERT_TYPE.SUCCESS,
            title: title || 'Éxito',
            textBody: message
        });
    },
    
    /**
     * Muestra diálogo de confirmación para cambiar estado
     */
    confirmStatusChange: (empleado, onConfirm) => {
        const nuevoEstado = !empleado.estado;
        const type = nuevoEstado ? ALERT_TYPE.SUCCESS : ALERT_TYPE.WARNING;
        const title = nuevoEstado ? 'Activar Empleado' : 'Desactivar Empleado';
        const message = `¿Está seguro que desea ${nuevoEstado ? 'activar' : 'desactivar'} al empleado ${empleado.nombre} ${empleado.apellido}?`;
        
        Dialog.show({
            type,
            title,
            textBody: message,
            button: 'Confirmar',
            onPressButton: () => {
                onConfirm();
                Toast.show({
                    type: nuevoEstado ? ALERT_TYPE.SUCCESS : ALERT_TYPE.WARNING,
                    title: 'Estado Actualizado',
                    textBody: `El empleado ha sido ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`
                });
            },
            cancelButton: 'Cancelar'
        });
    }
};

export default AlertService;