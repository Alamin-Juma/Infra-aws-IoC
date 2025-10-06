import { PrismaClient, VendorStatus } from '@prisma/client';


const prisma = new PrismaClient();

export const vendorRegister = async (data) => {
    try {
        const { 
            name, 
            phone, 
            email, 
            physicalAddress, 
            deviceTypeSupplied,  
        } = data;
        
        if (!name || !email || !physicalAddress || !deviceTypeSupplied) {
            throw new Error('Missing required fields: name, email, physicalAddress, deviceTypeSupplied');
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            throw new Error('INVALID_EMAIL: Invalid email format');
        }

       
        const existingVendorByName = await prisma.vendor.findUnique({
            where: {
                name
            },
        });
        if (existingVendorByName) {
            throw new Error(`DUPLICATE_NAME: Vendor with name "${name}" already exists`);
        }

    
        const existingVendorByEmail = await prisma.vendor.findUnique({ where: { email } });
        if (existingVendorByEmail) {
            throw new Error(`DUPLICATE_EMAIL: Vendor with email "${email}" already exists`);
        }

        const newVendor = await prisma.vendor.create({
            data: {
                name,
                phone,
                email,
                physicalAddress,
                status: VendorStatus.INACTIVE,
                vendorDevices: {
                    create: Array.isArray(deviceTypeSupplied)
                        ? deviceTypeSupplied.map((deviceId) => ({
                            deviceType: {
                                connect: { id: deviceId }
                            }
                        }))
                        : []
                }
            }
        });

        return { message: 'Vendor registered successfully', vendor: newVendor };
    } catch (error) {
        throw new Error(` ${error.message}`);
    }
};


export const updateVendorInDB = async (id, data) => {
    try {
        const {
            name,
            phone,
            email,
            physicalAddress,
            deviceTypeSupplied,
          } = data;
          

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            throw new Error('Invalid email format: Please provide a valid email address');
        }

        const existingVendor = await prisma.vendor.findUnique({ where: { id } });
        if (!existingVendor) {
            throw new Error(`Vendor with ID "${id}" not found`);
        }

        const vendorDevicesToCreate = Array.isArray(deviceTypeSupplied)
            ? deviceTypeSupplied
                .filter((deviceId) => typeof deviceId === 'number')
                .map((deviceId) => ({
                    deviceType: {
                        connect: { id: deviceId },
                    },
                }))
            : [];
            const updatedVendor = await prisma.vendor.update({
                where: { id },
                data: {
                  name,
                  phone,
                  email,
                  physicalAddress,
                  vendorDevices: {
                    create: vendorDevicesToCreate,
                  },
                  
                },
              });

        return { message: 'Vendor updated successfully', vendor: updatedVendor };
    } catch (error) {
        throw new Error(`Vendor update failed: ${error.message}`);
    }
};

export const fetchAllVendors = async (data) => {
    try {
        const { status, name, expiryBefore, page = 1, limit = 10 } = data;
        let where = {
            deletedAt: null, 
        };

        if (status) {
            where.status = status;
        }

        if (name) {
            where.name = {
                contains: name,
                mode: 'insensitive'
            };
        }

        if (expiryBefore) {
            where.contracts = {
            some: {
                endDate: {
                    gte: new Date(expiryBefore)
                }
            }
            };
        }

        const [vendors, totalCount] = await prisma.$transaction([
            prisma.vendor.findMany({
                where,
                include: {
                    vendorDevices: {
                        include: {
                            deviceType: true
                        }
                    },
                    contracts: true
                },
                orderBy: {
                    name: 'asc'
                },
                skip: (page - 1) * limit,
                take: parseInt(limit, 10)
            }),
            prisma.vendor.count({ where })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            message: 'Vendors fetched successfully',
            vendors,
            totalPages,
            totalCount
        };
    } catch (error) {
       
            throw new Error(`Server error while fetching vendors: ${error.message}`);
        
    }
};

export const getVendorById = async (id) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: Number(id) },
            include: {
                vendorDevices: {
                    include: {
                        deviceType: true
                    }
                }
            }
        });

        if (!vendor) {
            throw new Error(`Vendor with ID "${id}" not found`);
        }

        return vendor;
    } catch (error) {
        throw new Error(`Failed to fetch vendor by ID: ${error.message}`);
    }
};

export const archiveVendorr = async (id) => {
    try {
        const vendor = await prisma.vendor.update({
            where: { id: Number(id) },
            data: { deletedAt: new Date(), status: 'INACTIVE' } 
        });
        return { message: 'Vendor archived successfully', vendor };
    } catch (error) {

        throw new Error(`Failed to archive vendor: ${error.message}`);
    }
};
export const bulkArchiveVendors = async (req, res) => {
    try {
      const { ids } = req.body;
  
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "No valid vendor IDs provided." });
      }
  
      for (const id of ids) {
        try {
          await vendorIdParamSchema.validate({ id });
        } catch (validationError) {
          return res.status(400).json({ error: `Invalid ID: ${id}` });
        }
      }
  
      const archivedCount = await archiveVendorsByIds(ids);
  
      res.status(200).json({
        message: `${archivedCount} vendor(s) archived successfully.`,
      });
  
    } catch (error) {
      res.status(500).json({ message: "Server error while archiving vendors." });
    }
  };


  export const toggleVendorStatus = async (vendorId) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { contracts: true },
    });
  
    if (!vendor) throw new Error('Vendor not found');
  
    const isCurrentlyActive = vendor.status === VendorStatus.ACTIVE;
  
    const hasActiveContract = vendor.contracts
      ?.filter(contract =>  contract.endDate > new Date());
  
    if (!isCurrentlyActive && hasActiveContract.length === 0) {
      throw new Error('Vendor cannot be activated without an active contract');
    }
  
    const newStatus = isCurrentlyActive ? VendorStatus.INACTIVE : VendorStatus.ACTIVE;
  
    const updated = await prisma.vendor.update({
      where: { id: vendorId },
      data: { status: newStatus },
    });
  
    return updated.status;
  };
  
  