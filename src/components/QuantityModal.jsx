import { useState, useEffect } from "react";
import { Plus, Minus, X } from "lucide-react";

const QuantityModal = ({ isOpen, onClose, onConfirm, type, productName, currentStock }) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (quantity <= 0) {
      setError("กรุณากรอกจำนวนที่มากกว่า 0");
      return;
    }

    if (type === "decrease" && quantity > currentStock) {
      setError(`ไม่สามารถเบิกได้เกิน ${currentStock} ชิ้น`);
      return;
    }

    onConfirm(quantity);
    onClose();
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setQuantity(value);
    setError("");
  };

  const adjustQuantity = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    if (type === "decrease" && newQuantity > currentStock) {
      return;
    }
    setQuantity(newQuantity);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              type === "increase" 
                ? "bg-gradient-to-br from-green-500 to-emerald-500" 
                : "bg-gradient-to-br from-orange-500 to-red-500"
            }`}>
              {type === "increase" ? (
                <Plus className="w-5 h-5 text-white" />
              ) : (
                <Minus className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {type === "increase" ? "เพิ่มสินค้า" : "เบิกสินค้า"}
              </h2>
              <p className="text-sm text-slate-500">{productName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Stock Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">สต็อกปัจจุบัน:</span>
              <span className="text-slate-800 font-bold text-lg">{currentStock} ชิ้น</span>
            </div>
          </div>

          {/* Quantity Input Section */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              จำนวนที่ต้องการ{type === "increase" ? "เพิ่ม" : "เบิก"}:
            </label>
            
            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => adjustQuantity(-1)}
                disabled={quantity <= 1}
                className="p-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200"
              >
                <Minus className="w-4 h-4 text-slate-600" />
              </button>
              
              <input
                type="number"
                min="1"
                max={type === "decrease" ? currentStock : undefined}
                value={quantity}
                onChange={handleQuantityChange}
                className="flex-1 text-center text-xl font-bold py-3 px-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
              />
              
              <button
                onClick={() => adjustQuantity(1)}
                disabled={type === "decrease" && quantity >= currentStock}
                className="p-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200"
              >
                <Plus className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, type === "decrease" ? currentStock : 25].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    if (type === "decrease" && amount > currentStock) return;
                    setQuantity(amount);
                    setError("");
                  }}
                  disabled={type === "decrease" && amount > currentStock}
                  className="py-2 px-3 text-sm font-semibold bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                >
                  {amount === currentStock && type === "decrease" ? "ทั้งหมด" : amount}
                </button>
              ))}
            </div>

            {/* Result Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">จำนวนหลังทำรายการ:</span>
                <span className="text-blue-800 font-bold text-lg">
                  {type === "increase" 
                    ? currentStock + quantity 
                    : Math.max(0, currentStock - quantity)
                  } ชิ้น
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-all duration-200"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-3 px-4 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
              type === "increase"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            }`}
          >
            ยืนยัน{type === "increase" ? "เพิ่ม" : "เบิก"} {quantity} ชิ้น
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;