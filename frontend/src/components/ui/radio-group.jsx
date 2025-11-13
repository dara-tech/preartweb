"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle, Check } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const radioGroupVariants = cva(
  "grid gap-2",
  {
    variants: {
      orientation: {
        vertical: "grid-cols-1",
        horizontal: "grid-flow-col auto-cols-fr",
      },
      size: {
        sm: "gap-1",
        md: "gap-2",
        lg: "gap-3",
      },
    },
    defaultVariants: {
      orientation: "vertical",
      size: "md",
    },
  }
)

const radioGroupItemVariants = cva(
  "relative flex items-center justify-center rounded-none border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600",
  {
    variants: {
      variant: {
        default: "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400",
        outline: "border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50",
        filled: "bg-gray-100 hover:bg-gray-200 border-gray-200",
      },
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
        xl: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const radioGroupIndicatorVariants = cva(
  "flex items-center justify-center transition-all duration-200",
  {
    variants: {
      variant: {
        dot: "",
        check: "",
        fill: "",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
      },
    },
    defaultVariants: {
      variant: "dot",
      size: "md",
    },
  }
)

const RadioGroup = React.forwardRef(({ className, orientation, size, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn(radioGroupVariants({ orientation, size }), className)}
    {...props}
    ref={ref}
  />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  indicatorVariant = "dot", 
  ...props 
}, ref) => {
  const getIndicatorSize = () => {
    const sizes = {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
      xl: "h-3 w-3",
    }
    return sizes[size] || sizes.md
  }

  const getIconSize = () => {
    const sizes = {
      sm: "h-2 w-2",
      md: "h-2.5 w-2.5",
      lg: "h-3 w-3",
      xl: "h-3.5 w-3.5",
    }
    return sizes[size] || sizes.md
  }

  const renderIndicator = () => {
    const iconClassName = getIconSize()
    
    const indicators = {
      check: <Check className={cn(iconClassName, "text-current")} />,
      fill: <Circle className={cn(iconClassName, "fill-current text-current")} />,
      dot: (
        <div 
          className={cn(
            "rounded-none bg-current transition-all duration-200",
            getIndicatorSize()
          )} 
        />
      ),
    }
    
    return indicators[indicatorVariant] || indicators.dot
  }

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioGroupItemVariants({ variant, size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator 
        className={cn(radioGroupIndicatorVariants({ variant: indicatorVariant, size }))}
        forceMount
      >
        <div className="opacity-0 scale-0 data-[state=checked]:opacity-100 data-[state=checked]:scale-100 transition-all duration-200">
          {renderIndicator()}
        </div>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

const RadioGroupOption = React.forwardRef(({ 
  className, 
  value, 
  label, 
  description, 
  disabled, 
  itemProps,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-start space-x-3 rounded-none border border-transparent p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
    {...props}
  >
    <RadioGroupItem
      value={value}
      disabled={disabled}
      className="mt-0.5"
      {...itemProps}
    />
    <div className="grid gap-1 leading-none">
      <label
        htmlFor={value}
        className={cn(
          "text-sm font-medium cursor-pointer text-gray-900 dark:text-gray-100",
          disabled && "cursor-not-allowed"
        )}
      >
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  </div>
))
RadioGroupOption.displayName = "RadioGroupOption"

const RadioGroupWithOptions = React.forwardRef(({ 
  options = [], 
  value, 
  onValueChange, 
  className,
  optionClassName,
  itemProps,
  ...props 
}, ref) => (
  <RadioGroup
    ref={ref}
    value={value}
    onValueChange={onValueChange}
    className={className}
    {...props}
  >
    {options.map((option) => (
      <RadioGroupOption
        key={option.value}
        value={option.value}
        label={option.label}
        description={option.description}
        disabled={option.disabled}
        className={optionClassName}
        itemProps={itemProps}
      />
    ))}
  </RadioGroup>
))
RadioGroupWithOptions.displayName = "RadioGroupWithOptions"

const useRadioGroup = (initialValue = "", onChange) => {
  const [value, setValue] = React.useState(initialValue)

  const handleValueChange = React.useCallback((newValue) => {
    setValue(newValue)
    onChange?.(newValue)
  }, [onChange])

  const reset = React.useCallback(() => {
    setValue(initialValue)
  }, [initialValue])

  const isSelected = React.useCallback((optionValue) => {
    return value === optionValue
  }, [value])

  return {
    value,
    setValue: handleValueChange,
    reset,
    isSelected,
    props: {
      value,
      onValueChange: handleValueChange,
    }
  }
}

export { 
  RadioGroup, 
  RadioGroupItem, 
  RadioGroupOption, 
  RadioGroupWithOptions,
  useRadioGroup 
}
