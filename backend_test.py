import requests
import sys
import json
from datetime import datetime
import uuid

class HerbTraceabilityAPITester:
    def __init__(self, base_url="https://herb-track.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_batch_id = None
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "details": details
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("API Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, str(e))
            return False

    def test_create_collection(self):
        """Test collection creation endpoint"""
        try:
            collection_data = {
                "herb_type": "ashwagandha",
                "quantity_kg": 25.5,
                "location": {
                    "latitude": 15.3173,
                    "longitude": 75.7139,
                    "address": "Test Farm Location",
                    "district": "Ballari",
                    "state": "Karnataka"
                },
                "collector_name": "Test Collector",
                "collector_id": "TEST-001",
                "weather_conditions": "sunny",
                "soil_type": "loamy",
                "harvesting_method": "hand-picked",
                "notes": "Test collection for API testing"
            }

            response = requests.post(
                f"{self.api_url}/collection", 
                json=collection_data,
                timeout=15
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                self.created_batch_id = data.get('id')
                details += f", Batch ID: {self.created_batch_id}, Batch Number: {data.get('batch_number')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Create Collection Event", success, details)
            return success
        except Exception as e:
            self.log_test("Create Collection Event", False, str(e))
            return False

    def test_get_batches(self):
        """Test get all batches endpoint"""
        try:
            response = requests.get(f"{self.api_url}/batches", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Batches count: {len(data)}"
                if len(data) > 0:
                    details += f", First batch herb: {data[0].get('herb_type')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Get All Batches", success, details)
            return success
        except Exception as e:
            self.log_test("Get All Batches", False, str(e))
            return False

    def test_get_batch_details(self):
        """Test get specific batch details"""
        if not self.created_batch_id:
            self.log_test("Get Batch Details", False, "No batch ID available from collection test")
            return False
        
        try:
            response = requests.get(f"{self.api_url}/batch/{self.created_batch_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Batch: {data.get('batch_number')}, Herb: {data.get('herb_type')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Get Batch Details", success, details)
            return success
        except Exception as e:
            self.log_test("Get Batch Details", False, str(e))
            return False

    def test_add_processing_event(self):
        """Test adding processing event"""
        if not self.created_batch_id:
            self.log_test("Add Processing Event", False, "No batch ID available")
            return False
        
        try:
            processing_data = {
                "batch_id": self.created_batch_id,
                "processing_type": "drying",
                "processor_name": "Test Processing Unit",
                "processor_id": "PROC-001",
                "temperature": 60.0,
                "duration_hours": 24.0,
                "equipment_used": "Solar Dryer Model XY-200",
                "notes": "Test processing event"
            }

            response = requests.post(
                f"{self.api_url}/processing", 
                json=processing_data,
                timeout=15
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Message: {data.get('message')}, Event ID: {data.get('event_id')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Add Processing Event", success, details)
            return success
        except Exception as e:
            self.log_test("Add Processing Event", False, str(e))
            return False

    def test_add_testing_event(self):
        """Test adding testing/lab results event"""
        if not self.created_batch_id:
            self.log_test("Add Testing Event", False, "No batch ID available")
            return False
        
        try:
            testing_data = {
                "batch_id": self.created_batch_id,
                "lab_name": "Test Quality Control Lab",
                "lab_id": "LAB-001",
                "test_results": [
                    {
                        "test_type": "Moisture Content",
                        "result_value": "8.2",
                        "unit": "%",
                        "pass_status": True,
                        "lab_name": "Test Quality Control Lab",
                        "certificate_number": "CERT-001"
                    },
                    {
                        "test_type": "Heavy Metals (Lead)",
                        "result_value": "2.1",
                        "unit": "ppm",
                        "pass_status": True,
                        "lab_name": "Test Quality Control Lab",
                        "certificate_number": "CERT-002"
                    }
                ],
                "overall_grade": "A",
                "compliance_status": True,
                "notes": "All tests passed successfully"
            }

            response = requests.post(
                f"{self.api_url}/testing", 
                json=testing_data,
                timeout=15
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Message: {data.get('message')}, Event ID: {data.get('event_id')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Add Testing Event", success, details)
            return success
        except Exception as e:
            self.log_test("Add Testing Event", False, str(e))
            return False

    def test_get_provenance(self):
        """Test get batch provenance chain"""
        if not self.created_batch_id:
            self.log_test("Get Batch Provenance", False, "No batch ID available")
            return False
        
        try:
            response = requests.get(f"{self.api_url}/batch/{self.created_batch_id}/provenance", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Chain verified: {data.get('chain_verified')}, Events: {data.get('total_events')}"
                if data.get('provenance_chain'):
                    event_types = [event.get('event_type') for event in data['provenance_chain']]
                    details += f", Event types: {', '.join(event_types)}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Get Batch Provenance", success, details)
            return success
        except Exception as e:
            self.log_test("Get Batch Provenance", False, str(e))
            return False

    def test_generate_qr_code(self):
        """Test QR code generation"""
        if not self.created_batch_id:
            self.log_test("Generate QR Code", False, "No batch ID available")
            return False
        
        try:
            response = requests.get(f"{self.api_url}/qr/{self.created_batch_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Batch: {data.get('batch_number')}, Verification hash: {data.get('verification_hash')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Generate QR Code", success, details)
            return success
        except Exception as e:
            self.log_test("Generate QR Code", False, str(e))
            return False

    def test_invalid_batch_operations(self):
        """Test operations with invalid batch ID"""
        invalid_batch_id = "invalid-batch-id-123"
        
        # Test get invalid batch
        try:
            response = requests.get(f"{self.api_url}/batch/{invalid_batch_id}", timeout=10)
            success = response.status_code == 404
            details = f"Status: {response.status_code} (Expected 404)"
            self.log_test("Invalid Batch - Get Details", success, details)
        except Exception as e:
            self.log_test("Invalid Batch - Get Details", False, str(e))
        
        # Test processing with invalid batch
        try:
            processing_data = {
                "batch_id": invalid_batch_id,
                "processing_type": "drying",
                "processor_name": "Test Processor"
            }
            response = requests.post(f"{self.api_url}/processing", json=processing_data, timeout=10)
            success = response.status_code == 404
            details = f"Status: {response.status_code} (Expected 404)"
            self.log_test("Invalid Batch - Add Processing", success, details)
        except Exception as e:
            self.log_test("Invalid Batch - Add Processing", False, str(e))

    def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Starting Herb Traceability API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity
        if not self.test_api_root():
            print("❌ API root test failed. Stopping tests.")
            return False
        
        # Test collection creation (this creates a batch for other tests)
        self.test_create_collection()
        
        # Test batch operations
        self.test_get_batches()
        self.test_get_batch_details()
        
        # Test supply chain events
        self.test_add_processing_event()
        self.test_add_testing_event()
        
        # Test provenance and QR
        self.test_get_provenance()
        self.test_generate_qr_code()
        
        # Test error handling
        self.test_invalid_batch_operations()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.created_batch_id:
            print(f"   Created Batch ID: {self.created_batch_id}")
        
        # Return success if all critical tests passed
        critical_tests = [
            "API Root Endpoint",
            "Create Collection Event", 
            "Get All Batches",
            "Add Processing Event",
            "Add Testing Event",
            "Get Batch Provenance"
        ]
        
        critical_passed = sum(1 for result in self.test_results 
                            if result["test_name"] in critical_tests and result["success"])
        
        success_rate = (self.tests_passed / self.tests_run) * 100
        return success_rate >= 80  # Consider successful if 80%+ tests pass

def main():
    tester = HerbTraceabilityAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "base_url": tester.base_url,
        "tests_run": tester.tests_run,
        "tests_passed": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0,
        "created_batch_id": tester.created_batch_id,
        "test_results": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())