"use client";

import { useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { createClientService } from "@/services/clientService";
import { createLogService } from "@/services/logService";
import { createOrderService } from "@/services/orderService";
import { createProductService } from "@/services/productService";
import { createSettingsService } from "@/services/settingsService";

export function useServiceLayer() {
  const recordLog = useMutation(api.logs.record);
  const clearLog = useMutation(api.logs.clear);
  const createProductMutation = useMutation(api.products.createProduct);
  const updateProductMutation = useMutation(api.products.updateProduct);
  const deleteProductMutation = useMutation(api.products.deleteProduct);
  const createClientMutation = useMutation(api.clients.createClient);
  const updateClientMutation = useMutation(api.clients.updateClient);
  const deleteClientMutation = useMutation(api.clients.deleteClient);
  const createOrderMutation = useMutation(api.orders.createOrder);
  const updateOrderStatusMutation = useMutation(api.orders.updateOrderStatus);
  const updateOrganizationMutation = useMutation(api.organizations.updateOrganization);

  return useMemo(() => {
    const logService = createLogService({
      recordMutation: recordLog,
      clearMutation: clearLog,
    });

    return {
      logService,
      productService: createProductService({
        createMutation: createProductMutation,
        updateMutation: updateProductMutation,
        deleteMutation: deleteProductMutation,
        log: logService.record,
      }),
      clientService: createClientService({
        createMutation: createClientMutation,
        updateMutation: updateClientMutation,
        deleteMutation: deleteClientMutation,
        log: logService.record,
      }),
      orderService: createOrderService({
        createMutation: createOrderMutation,
        updateStatusMutation: updateOrderStatusMutation,
        log: logService.record,
      }),
      settingsService: createSettingsService({
        updateOrgMutation: updateOrganizationMutation,
        log: logService.record,
      }),
    };
  }, [
    clearLog,
    createClientMutation,
    createOrderMutation,
    createProductMutation,
    deleteClientMutation,
    deleteProductMutation,
    recordLog,
    updateClientMutation,
    updateOrderStatusMutation,
    updateOrganizationMutation,
    updateProductMutation,
  ]);
}
