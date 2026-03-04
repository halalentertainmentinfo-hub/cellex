import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../store';
import { formatPrice } from './utils';

export const generateOrderPDF = (order: Order) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(242, 125, 38); // ios-orange
  doc.text('CELLEX PREMIUM GADGETS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Premium Experience, Delivered.', 105, 28, { align: 'center' });

  // Invoice Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Invoice Number: ${order.id}`, 20, 45);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 52);
  doc.text(`Status: ${order.status}`, 20, 59);

  // Customer Info
  doc.setFontSize(14);
  doc.text('Customer Details', 20, 75);
  doc.setFontSize(10);
  doc.text(`Name: ${order.userName}`, 20, 82);
  doc.text(`User ID: ${order.userId}`, 20, 89);

  // Table
  const tableData = order.items.map(item => [
    item.name,
    item.brand,
    item.quantity.toString(),
    formatPrice(item.price),
    formatPrice(item.price * item.quantity)
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['Product', 'Brand', 'Qty', 'Price', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [242, 125, 38] },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.result.finalY;
  doc.setFontSize(14);
  doc.text(`Total Amount: ${formatPrice(order.total)}`, 140, finalY + 20);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Thank you for shopping with Cellex!', 105, 280, { align: 'center' });

  doc.save(`Invoice_${order.id.replace('#', '')}.pdf`);
};
