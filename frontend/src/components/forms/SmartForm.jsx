import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  validateDate, 
  validateAge, 
  validateVisitDate, 
  validateAppointmentDate,
  validateHIVTestDate,
  validateBusinessRules,
  calculateAge,
  determinePatientStatus,
  calculateNextAppointment,
  checkDataQuality,
  getSmartDefaults,
  getContextualHelp,
  getRequiredFields
} from '../../shared/utils/utils';

const SmartForm = ({ 
  patientType = 'infant', 
  initialData = {}, 
  onSubmit, 
  onCancel,
  previousVisits = []
}) => {
  const [formData, setFormData] = useState({
    clinicId: '',
    visitDate: '',
    birthDate: '',
    age: '',
    weight: '',
    height: '',
    motherHIVStatus: '',
    motherClinicID: '',
    motherARTNumber: '',
    hivStatus: '',
    artNumber: '',
    whoStage: '',
    nextAppointment: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [contextualHelp, setContextualHelp] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);

  // Calculate age when birth date or visit date changes
  useEffect(() => {
    if (formData.birthDate && formData.visitDate) {
      const ageData = calculateAge(formData.birthDate, formData.visitDate);
      if (ageData) {
        setFormData(prev => ({
          ...prev,
          age: ageData.value,
          ageUnit: ageData.unit,
          ageDisplay: ageData.display
        }));
      }
    }
  }, [formData.birthDate, formData.visitDate, formData.ageUnit]);

  // Determine patient status based on age
  useEffect(() => {
    if (formData.age) {
      const ageInMonths = formData.ageUnit === 'months' ? formData.age : formData.age * 12;
      const statusData = determinePatientStatus(ageInMonths);
      setFormData(prev => ({
        ...prev,
        patientStatus: statusData.status,
        patientStatusText: statusData.text,
        statusReason: statusData.reason
      }));
    }
  }, [formData.age, formData.ageUnit]);

  // Calculate next appointment
  useEffect(() => {
    if (formData.age && formData.visitDate) {
      const ageInMonths = formData.ageUnit === 'months' ? formData.age : formData.age * 12;
      const nextAppointment = calculateNextAppointment(ageInMonths, formData.visitDate);
      setFormData(prev => ({
        ...prev,
        nextAppointment
      }));
    }
  }, [formData.age, formData.visitDate, formData.ageUnit]);

  // Set contextual help and required fields
  useEffect(() => {
    const ageInMonths = formData.ageUnit === 'months' ? formData.age : formData.age * 12;
    setContextualHelp(getContextualHelp(patientType, ageInMonths));
    setRequiredFields(getRequiredFields(patientType, formData.age, formData.hivStatus));
  }, [patientType, formData.age, formData.hivStatus]);

  // Check data quality
  useEffect(() => {
    const qualityAlerts = checkDataQuality({
      ...formData,
      patientType,
      lastVisit: previousVisits[0]?.visitDate
    });
    setAlerts(qualityAlerts);
  }, [formData, patientType, previousVisits]);

  // Load smart defaults
  useEffect(() => {
    if (previousVisits.length > 0) {
      const defaults = getSmartDefaults(formData.clinicId, previousVisits);
      setFormData(prev => ({
        ...prev,
        ...defaults
      }));
    }
  }, [previousVisits, formData.clinicId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateField = (field, value) => {
    const fieldErrors = [];

    switch (field) {
      case 'visitDate':
        fieldErrors.push(...validateDate(value, 'Visit Date'));
        if (formData.birthDate) {
          fieldErrors.push(...validateVisitDate(value, formData.birthDate));
        }
        break;
      case 'birthDate':
        fieldErrors.push(...validateDate(value, 'Birth Date', { minDate: '1930-01-01' }));
        if (formData.visitDate) {
          fieldErrors.push(...validateVisitDate(formData.visitDate, value));
        }
        break;
      case 'age':
        fieldErrors.push(...validateAge(value, 'Age'));
        break;
      case 'nextAppointment':
        if (formData.visitDate) {
          fieldErrors.push(...validateAppointmentDate(value, formData.visitDate));
        }
        break;
      case 'hivTestDate':
        if (formData.visitDate) {
          fieldErrors.push(...validateHIVTestDate(value, formData.visitDate));
        }
        break;
    }

    if (fieldErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });

    // Validate business rules
    const businessErrors = validateBusinessRules({
      ...formData,
      patientType
    });

    if (businessErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        business: businessErrors
      }));
      return;
    }

    // Check if all required fields are filled
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setErrors(prev => ({
        ...prev,
        required: `Missing required fields: ${missingFields.join(', ')}`
      }));
      return;
    }

    onSubmit(formData);
  };

  const isFieldRequired = (field) => requiredFields.includes(field);
  const hasError = (field) => errors[field] && errors[field].length > 0;

  return (
    <div className="space-y-6">
      {/* Data Quality Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Contextual Help */}
      {contextualHelp.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Guidance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {contextualHelp.map((help, index) => (
                <p key={index} className="text-sm text-muted-foreground">{help}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Status Display */}
      {formData.patientStatusText && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Badge variant={formData.patientStatus === -1 ? 'default' : 'destructive'}>
                {formData.patientStatusText}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formData.statusReason}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="clinicId">
                Clinic ID {isFieldRequired('clinicId') && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="clinicId"
                value={formData.clinicId}
                onChange={(e) => handleInputChange('clinicId', e.target.value)}
                className={hasError('clinicId') ? 'border-destructive' : ''}
              />
              {hasError('clinicId') && (
                <p className="text-sm text-destructive mt-1">{errors.clinicId[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="visitDate">
                Visit Date {isFieldRequired('visitDate') && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="visitDate"
                type="date"
                value={formData.visitDate}
                onChange={(e) => handleInputChange('visitDate', e.target.value)}
                onBlur={() => validateField('visitDate', formData.visitDate)}
                className={hasError('visitDate') ? 'border-destructive' : ''}
              />
              {hasError('visitDate') && (
                <p className="text-sm text-destructive mt-1">{errors.visitDate[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="birthDate">
                Birth Date {isFieldRequired('birthDate') && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                onBlur={() => validateField('birthDate', formData.birthDate)}
                className={hasError('birthDate') ? 'border-destructive' : ''}
              />
              {hasError('birthDate') && (
                <p className="text-sm text-destructive mt-1">{errors.birthDate[0]}</p>
              )}
            </div>

            {/* Age Display */}
            {formData.ageDisplay && (
              <div>
                <Label>Calculated Age</Label>
                <div className="p-2 bg-muted rounded-md">
                  <span className="font-medium">{formData.ageDisplay}</span>
                </div>
              </div>
            )}
          </div>

          {/* Patient Type Specific Fields */}
          <div className="space-y-4">
            {patientType === 'infant' && (
              <>
                <div>
                  <Label htmlFor="weight">
                    Weight (kg) {isFieldRequired('weight') && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className={hasError('weight') ? 'border-destructive' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor="height">
                    Height (cm) {isFieldRequired('height') && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className={hasError('height') ? 'border-destructive' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor="motherHIVStatus">
                    Mother HIV Status {isFieldRequired('motherHIVStatus') && <span className="text-destructive">*</span>}
                  </Label>
                  <select
                    id="motherHIVStatus"
                    value={formData.motherHIVStatus}
                    onChange={(e) => handleInputChange('motherHIVStatus', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Status</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                {formData.motherHIVStatus === 'positive' && (
                  <>
                    <div>
                      <Label htmlFor="motherClinicID">
                        Mother Clinic ID {isFieldRequired('motherClinicID') && <span className="text-destructive">*</span>}
                      </Label>
                      <Input
                        id="motherClinicID"
                        value={formData.motherClinicID}
                        onChange={(e) => handleInputChange('motherClinicID', e.target.value)}
                        className={hasError('motherClinicID') ? 'border-destructive' : ''}
                      />
                    </div>

                    <div>
                      <Label htmlFor="motherARTNumber">
                        Mother ART Number {isFieldRequired('motherARTNumber') && <span className="text-destructive">*</span>}
                      </Label>
                      <Input
                        id="motherARTNumber"
                        value={formData.motherARTNumber}
                        onChange={(e) => handleInputChange('motherARTNumber', e.target.value)}
                        className={hasError('motherARTNumber') ? 'border-destructive' : ''}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Next Appointment */}
            <div>
              <Label htmlFor="nextAppointment">Next Appointment</Label>
              <Input
                id="nextAppointment"
                type="date"
                value={formData.nextAppointment}
                onChange={(e) => handleInputChange('nextAppointment', e.target.value)}
                onBlur={() => validateField('nextAppointment', formData.nextAppointment)}
                className={hasError('nextAppointment') ? 'border-destructive' : ''}
              />
              {hasError('nextAppointment') && (
                <p className="text-sm text-destructive mt-1">{errors.nextAppointment[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Rule Errors */}
        {errors.business && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.business.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Required Fields Error */}
        {errors.required && (
          <Alert variant="destructive">
            <AlertDescription>{errors.required}</AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Visit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SmartForm;
