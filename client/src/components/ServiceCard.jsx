
import React from 'react';
import { Monitor, TrendingUp, Share2, Check } from 'lucide-react';

const icons = {
    web_dev: Monitor,
    seo: TrendingUp,
    smm: Share2,
    default: Monitor
};

const ServiceCard = ({ service, isSelected, quantity, onToggle, onQuantityChange }) => {
    const Icon = icons[service.id] || icons.default;

    return (
        <div
            className={`service-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onToggle(service.id)}
        >
            <div className="service-header">
                <div className="checkbox-wrapper">
                    <div className="custom-checkbox">
                        <Check size={14} className="checkmark-icon" color="white" strokeWidth={3} />
                    </div>
                    <div className="service-info">
                        <div className="icon-wrapper">
                            <Icon size={24} className="service-icon" />
                        </div>
                        <div>
                            <h3>{service.name}</h3>
                            <span>{service.label}</span>
                        </div>
                    </div>
                </div>
                <div className="price-tag">${service.price}</div>
            </div>

            {isSelected && (
                <div className="quantity-control" onClick={(e) => e.stopPropagation()}>
                    <label>
                        Duration / Quantity
                        <span style={{ fontWeight: 'normal', opacity: 0.7 }}>
                            {' '}({service.type === 'monthly' ? 'Months' : 'Units'})
                        </span>
                    </label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => onQuantityChange(service.id, e.target.value)}
                        min="1"
                        step="1"
                        className="quantity-input"
                    />
                </div>
            )}
        </div>
    );
};

export default ServiceCard;
