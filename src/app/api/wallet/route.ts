import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAuthorizedAdminNim } from '@/lib/mock-data';

export function parseBalancesFromSpecialty(
  specialty?: string[] | null,
  activeMode?: string,
  walletBalance?: number
) {
  let custBal = 50000;
  let runBal = 25000;
  let admBal = 2500000;

  let hasCust = false;
  let hasRun = false;
  let hasAdm = false;

  if (Array.isArray(specialty)) {
    for (const item of specialty) {
      if (item.startsWith('BAL_CUST:')) {
        const val = parseInt(item.replace('BAL_CUST:', ''), 10);
        if (!isNaN(val)) {
          custBal = val;
          hasCust = true;
        }
      } else if (item.startsWith('BAL_RUN:')) {
        const val = parseInt(item.replace('BAL_RUN:', ''), 10);
        if (!isNaN(val)) {
          runBal = val;
          hasRun = true;
        }
      } else if (item.startsWith('BAL_ADM:')) {
        const val = parseInt(item.replace('BAL_ADM:', ''), 10);
        if (!isNaN(val)) {
          admBal = val;
          hasAdm = true;
        }
      }
    }
  }

  // Fallback: jika tag belum ada, sinkronkan dengan wallet_balance kolom yang ada di database
  if (walletBalance !== undefined && walletBalance !== null) {
    if (activeMode === 'runner' && !hasRun) {
      runBal = walletBalance;
    } else if (activeMode === 'customer' && !hasCust) {
      custBal = walletBalance;
    }
  }

  return { custBal, runBal, admBal };
}

export function buildUpdatedSpecialty(
  existing: string[] | null | undefined,
  custBal: number,
  runBal: number,
  admBal: number
): string[] {
  const baseSpecialties = (existing || []).filter(
    (item) =>
      !item.startsWith('BAL_CUST:') &&
      !item.startsWith('BAL_RUN:') &&
      !item.startsWith('BAL_ADM:')
  );
  if (baseSpecialties.length === 0) {
    baseSpecialties.push('JASTAP', 'JARVIS');
  }
  return [
    ...baseSpecialties,
    `BAL_CUST:${Math.round(custBal)}`,
    `BAL_RUN:${Math.round(runBal)}`,
    `BAL_ADM:${Math.round(admBal)}`
  ];
}

// GET /api/wallet?nim=...&role=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nim = searchParams.get('nim')?.trim() || '';
    const role = (searchParams.get('role')?.trim() || 'customer').toLowerCase();

    if (!nim) {
      return NextResponse.json(
        { success: false, message: 'Parameter NIM wajib diisi.' },
        { status: 400 }
      );
    }

    const isAdmin = isAuthorizedAdminNim(nim);
    let custBal = 50000;
    let runBal = 25000;
    let admBal = isAdmin ? 2500000 : 0;

    if (supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('nim', nim)
        .maybeSingle();

      if (profile) {
        const parsed = parseBalancesFromSpecialty(
          profile.runner_specialty,
          profile.active_mode,
          profile.wallet_balance
        );
        custBal = parsed.custBal;
        runBal = parsed.runBal;
        if (isAdmin) {
          admBal = parsed.admBal;
        }
      }
    }

    const activeBal =
      role === 'runner' ? runBal : role === 'admin' && isAdmin ? admBal : custBal;

    return NextResponse.json({
      success: true,
      nim,
      role,
      customer_balance: custBal,
      runner_balance: runBal,
      admin_balance: admBal,
      active_balance: activeBal
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Gagal memuat saldo dompet';
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 });
  }
}

// POST /api/wallet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, nim, role, amount, method, accountNumber } = body;

    const cleanNim = (nim || '').toString().trim();
    const cleanRole = (role || 'customer').toString().trim().toLowerCase();
    const cleanAmt = parseInt(amount, 10);

    if (!cleanNim) {
      return NextResponse.json(
        { success: false, message: 'NIM wajib diisi.' },
        { status: 400 }
      );
    }

    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      return NextResponse.json(
        { success: false, message: 'Nominal transaksi tidak valid.' },
        { status: 400 }
      );
    }

    // Ambil profil saat ini dari Supabase
    let profileData: {
      id?: string;
      runner_specialty?: string[];
      active_mode?: string;
      wallet_balance?: number;
    } | null = null;

    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('id, runner_specialty, active_mode, wallet_balance')
        .eq('nim', cleanNim)
        .maybeSingle();
      profileData = data;
    }

    const currentBalances = parseBalancesFromSpecialty(
      profileData?.runner_specialty,
      profileData?.active_mode,
      profileData?.wallet_balance
    );

    let newCustBal = currentBalances.custBal;
    let newRunBal = currentBalances.runBal;
    let newAdmBal = currentBalances.admBal;

    if (action === 'topup') {
      if (cleanAmt < 5000) {
        return NextResponse.json(
          { success: false, message: 'Minimal nominal top up saldo adalah Rp 5.000' },
          { status: 400 }
        );
      }

      // Pisahkan penambahan saldo berdasarkan peran:
      if (cleanRole === 'runner') {
        newRunBal += cleanAmt;
      } else if (cleanRole === 'admin') {
        newAdmBal += cleanAmt;
      } else {
        // Customer
        newCustBal += cleanAmt;
      }

      // Update ke database Supabase
      if (supabase && profileData?.id) {
        const updatedSpecialty = buildUpdatedSpecialty(
          profileData.runner_specialty,
          newCustBal,
          newRunBal,
          newAdmBal
        );
        const activeBalanceToSave =
          profileData.active_mode === 'runner'
            ? newRunBal
            : newCustBal;

        await supabase
          .from('profiles')
          .update({
            runner_specialty: updatedSpecialty,
            wallet_balance: activeBalanceToSave
          })
          .eq('id', profileData.id);
      }

      const activeNewBalance =
        cleanRole === 'runner'
          ? newRunBal
          : cleanRole === 'admin'
          ? newAdmBal
          : newCustBal;

      return NextResponse.json({
        success: true,
        message: `Top up saldo ${cleanRole === 'runner' ? 'Runner' : cleanRole === 'admin' ? 'Admin' : 'Customer'} sebesar Rp ${cleanAmt.toLocaleString('id-ID')} via ${method || 'QRIS'} berhasil!`,
        action: 'topup',
        role: cleanRole,
        amount: cleanAmt,
        method: method || 'QRIS',
        customer_balance: newCustBal,
        runner_balance: newRunBal,
        admin_balance: newAdmBal,
        newBalance: activeNewBalance
      });
    } else if (action === 'withdraw') {
      if (cleanAmt < 10000) {
        return NextResponse.json(
          { success: false, message: 'Minimal penarikan saldo adalah Rp 10.000' },
          { status: 400 }
        );
      }

      // Validasi kecukupan saldo sesuai peran
      const currentRoleBal =
        cleanRole === 'runner' ? newRunBal : newCustBal;

      if (cleanAmt > currentRoleBal) {
        return NextResponse.json(
          {
            success: false,
            message: `Saldo ${cleanRole === 'runner' ? 'Runner' : 'Customer'} tidak mencukupi untuk penarikan ini.`
          },
          { status: 400 }
        );
      }

      // Potong saldo sesuai peran
      if (cleanRole === 'runner') {
        newRunBal -= cleanAmt;
      } else {
        newCustBal -= cleanAmt;
      }

      // Update ke database Supabase
      if (supabase && profileData?.id) {
        const updatedSpecialty = buildUpdatedSpecialty(
          profileData.runner_specialty,
          newCustBal,
          newRunBal,
          newAdmBal
        );
        const activeBalanceToSave =
          profileData.active_mode === 'runner' ? newRunBal : newCustBal;

        await supabase
          .from('profiles')
          .update({
            runner_specialty: updatedSpecialty,
            wallet_balance: activeBalanceToSave
          })
          .eq('id', profileData.id);
      }

      const activeNewBalance =
        cleanRole === 'runner' ? newRunBal : newCustBal;

      return NextResponse.json({
        success: true,
        message: `Berhasil mencairkan Rp ${cleanAmt.toLocaleString('id-ID')} ke ${method || 'E-Wallet'} (${accountNumber || '-'})`,
        action: 'withdraw',
        role: cleanRole,
        amount: cleanAmt,
        method: method || 'E-Wallet',
        accountNumber: accountNumber || '',
        customer_balance: newCustBal,
        runner_balance: newRunBal,
        admin_balance: newAdmBal,
        newBalance: activeNewBalance
      });
    }

    return NextResponse.json(
      { success: false, message: `Aksi ${action} tidak didukung.` },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada backend dompet';
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 });
  }
}
